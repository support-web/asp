# アフィリエイトサービスプロバイダ（ASP）システム仕様書

## 1. プロジェクト概要

### 1.1 システム概要
本システムは、広告主（マーチャント）とアフィリエイター（パブリッシャー）を仲介するアフィリエイトサービスプロバイダ（ASP）プラットフォームです。A8.netのような成果報酬型広告の管理・配信・トラッキング・決済を一元管理します。

### 1.2 主要ステークホルダー
| ロール | 説明 |
|--------|------|
| 管理者（Admin） | システム全体の管理、審査、運営を行う |
| 広告主（Advertiser） | 広告プログラムを出稿し、成果に対して報酬を支払う |
| アフィリエイター（Publisher） | 広告を掲載し、成果に応じて報酬を受け取る |

### 1.3 技術スタック（推奨）
```
フロントエンド: Next.js 14+ (App Router), TypeScript, Tailwind CSS
バックエンド: Node.js (Express/Fastify) または Go
データベース: PostgreSQL（メイン）, Redis（キャッシュ/セッション）
インフラ: AWS / GCP / Azure
その他: Docker, Kubernetes, Nginx
```

---

## 2. システムアーキテクチャ

### 2.1 全体構成図
```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront/Cloudflare)              │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer (ALB/NLB)                      │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Web Server    │  │   API Server    │  │ Tracking Server │
│   (Next.js)     │  │   (REST/GraphQL)│  │  (High Performance)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    Message Queue (RabbitMQ/SQS)                  │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis       │  │   Elasticsearch │
│   (Primary DB)  │  │ (Cache/Session) │  │   (Search/Log)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.2 マイクロサービス構成
```
services/
├── auth-service/          # 認証・認可
├── user-service/          # ユーザー管理
├── advertiser-service/    # 広告主管理
├── publisher-service/     # アフィリエイター管理
├── program-service/       # 広告プログラム管理
├── tracking-service/      # クリック・CV追跡
├── reporting-service/     # レポート・分析
├── payment-service/       # 決済・支払い
├── notification-service/  # 通知
└── admin-service/         # 管理者機能
```

---

## 3. データベース設計

### 3.1 ER図概要
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │────<│  advertisers │     │  publishers  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            │                    │
                     ┌──────────────┐     ┌──────────────┐
                     │   programs   │────<│ partnerships │
                     └──────────────┘     └──────────────┘
                            │                    │
                     ┌──────────────┐            │
                     │   creatives  │            │
                     └──────────────┘            │
                                                 │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    clicks    │────>│ conversions  │────>│  commissions │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                          ┌──────────────┐
                                          │   payouts    │
                                          └──────────────┘
```

### 3.2 テーブル定義

#### 3.2.1 users（ユーザー基本情報）
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'advertiser', 'publisher') NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'banned') DEFAULT 'pending',
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
```

#### 3.2.2 advertisers（広告主）
```sql
CREATE TABLE advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_name_kana VARCHAR(255),
    representative_name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    address TEXT,
    phone VARCHAR(20),
    website_url VARCHAR(500),
    business_type VARCHAR(100),
    description TEXT,
    logo_url VARCHAR(500),
    
    -- 審査関連
    status ENUM('pending_review', 'approved', 'rejected', 'suspended') DEFAULT 'pending_review',
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- 契約・請求関連
    contract_type ENUM('prepaid', 'postpaid') DEFAULT 'prepaid',
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    billing_email VARCHAR(255),
    
    -- 法人情報
    corporate_number VARCHAR(20),
    invoice_registration_number VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX idx_advertisers_status ON advertisers(status);
```

#### 3.2.3 publishers（アフィリエイター）
```sql
CREATE TABLE publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publisher_type ENUM('individual', 'corporate') NOT NULL,
    
    -- 個人情報
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    first_name_kana VARCHAR(50),
    last_name_kana VARCHAR(50),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    
    -- 法人情報（法人の場合）
    company_name VARCHAR(255),
    representative_name VARCHAR(100),
    corporate_number VARCHAR(20),
    
    -- 連絡先
    postal_code VARCHAR(10),
    address TEXT,
    phone VARCHAR(20),
    
    -- 審査関連
    status ENUM('pending_review', 'approved', 'rejected', 'suspended') DEFAULT 'pending_review',
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- ランク制度
    rank ENUM('regular', 'bronze', 'silver', 'gold', 'platinum') DEFAULT 'regular',
    total_earnings DECIMAL(15, 2) DEFAULT 0,
    
    -- 銀行口座情報
    bank_name VARCHAR(100),
    bank_code VARCHAR(10),
    branch_name VARCHAR(100),
    branch_code VARCHAR(10),
    account_type ENUM('ordinary', 'current', 'savings') DEFAULT 'ordinary',
    account_number VARCHAR(20),
    account_holder_name VARCHAR(100),
    
    -- 税務情報
    tax_status ENUM('taxable', 'exempt') DEFAULT 'taxable',
    my_number_registered BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publishers_user_id ON publishers(user_id);
CREATE INDEX idx_publishers_status ON publishers(status);
CREATE INDEX idx_publishers_rank ON publishers(rank);
```

#### 3.2.4 publisher_sites（メディアサイト）
```sql
CREATE TABLE publisher_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    site_name VARCHAR(255) NOT NULL,
    site_url VARCHAR(500) NOT NULL,
    site_type ENUM('website', 'blog', 'sns', 'email', 'app', 'other') NOT NULL,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    monthly_pv INTEGER,
    monthly_uu INTEGER,
    
    -- 審査関連
    status ENUM('pending_review', 'approved', 'rejected', 'suspended') DEFAULT 'pending_review',
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- SNS詳細（SNSの場合）
    sns_platform VARCHAR(50),
    sns_account_id VARCHAR(255),
    sns_followers INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publisher_sites_publisher_id ON publisher_sites(publisher_id);
CREATE INDEX idx_publisher_sites_status ON publisher_sites(status);
```

#### 3.2.5 programs（広告プログラム）
```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    promotion_text TEXT,
    
    -- カテゴリ
    category_id UUID REFERENCES categories(id),
    
    -- URL設定
    landing_page_url VARCHAR(500) NOT NULL,
    tracking_domain VARCHAR(255),
    
    -- 報酬設定
    commission_type ENUM('cpa', 'cpc', 'cpm', 'hybrid') NOT NULL,
    commission_amount DECIMAL(10, 2),
    commission_rate DECIMAL(5, 2),
    second_tier_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Cookie設定
    cookie_duration_days INTEGER DEFAULT 30,
    attribution_model ENUM('last_click', 'first_click', 'linear') DEFAULT 'last_click',
    
    -- プログラム設定
    auto_approve_publishers BOOLEAN DEFAULT FALSE,
    requires_review BOOLEAN DEFAULT TRUE,
    min_payout_threshold DECIMAL(10, 2) DEFAULT 1000,
    
    -- 成果条件
    conversion_conditions TEXT,
    denied_conditions TEXT,
    
    -- 期間設定
    start_date DATE,
    end_date DATE,
    
    -- ステータス
    status ENUM('draft', 'pending_review', 'active', 'paused', 'ended') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'invite_only') DEFAULT 'public',
    
    -- 統計キャッシュ
    total_clicks BIGINT DEFAULT 0,
    total_conversions BIGINT DEFAULT 0,
    total_commission_paid DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_programs_advertiser_id ON programs(advertiser_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_category_id ON programs(category_id);
CREATE INDEX idx_programs_program_code ON programs(program_code);
```

#### 3.2.6 program_creatives（広告クリエイティブ）
```sql
CREATE TABLE program_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    creative_type ENUM('banner', 'text', 'email', 'product_feed') NOT NULL,
    creative_name VARCHAR(255) NOT NULL,
    
    -- バナー広告
    image_url VARCHAR(500),
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    
    -- テキスト広告
    headline VARCHAR(100),
    body_text TEXT,
    
    -- 共通
    destination_url VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    -- 統計キャッシュ
    impression_count BIGINT DEFAULT 0,
    click_count BIGINT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_program_creatives_program_id ON program_creatives(program_id);
CREATE INDEX idx_program_creatives_creative_type ON program_creatives(creative_type);
```

#### 3.2.7 partnerships（提携関係）
```sql
CREATE TABLE partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    site_id UUID REFERENCES publisher_sites(id),
    
    -- 提携状態
    status ENUM('pending', 'approved', 'rejected', 'terminated') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- カスタム報酬（特別単価）
    custom_commission_amount DECIMAL(10, 2),
    custom_commission_rate DECIMAL(5, 2),
    
    -- アフィリエイトリンク
    affiliate_code VARCHAR(50) NOT NULL UNIQUE,
    tracking_url VARCHAR(500),
    
    -- 統計キャッシュ
    total_clicks BIGINT DEFAULT 0,
    total_conversions BIGINT DEFAULT 0,
    total_earnings DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(program_id, publisher_id)
);

CREATE INDEX idx_partnerships_program_id ON partnerships(program_id);
CREATE INDEX idx_partnerships_publisher_id ON partnerships(publisher_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_partnerships_affiliate_code ON partnerships(affiliate_code);
```

#### 3.2.8 clicks（クリックログ）
```sql
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id),
    creative_id UUID REFERENCES program_creatives(id),
    
    -- トラッキング情報
    click_id VARCHAR(100) NOT NULL UNIQUE,
    tracking_code VARCHAR(100),
    sub_id1 VARCHAR(255),
    sub_id2 VARCHAR(255),
    sub_id3 VARCHAR(255),
    sub_id4 VARCHAR(255),
    sub_id5 VARCHAR(255),
    
    -- アクセス情報
    ip_address INET NOT NULL,
    user_agent TEXT,
    referer_url TEXT,
    landing_url TEXT,
    
    -- デバイス情報
    device_type ENUM('desktop', 'mobile', 'tablet', 'other'),
    os VARCHAR(50),
    os_version VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    
    -- 地理情報
    country_code CHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- フィンガープリント
    fingerprint_hash VARCHAR(64),
    
    -- 不正検知フラグ
    is_suspicious BOOLEAN DEFAULT FALSE,
    fraud_score INTEGER DEFAULT 0,
    fraud_reasons JSONB,
    
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- パーティショニング（月別）
CREATE INDEX idx_clicks_partnership_id ON clicks(partnership_id);
CREATE INDEX idx_clicks_click_id ON clicks(click_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_ip_address ON clicks(ip_address);
```

#### 3.2.9 conversions（コンバージョン）
```sql
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES clicks(id),
    partnership_id UUID NOT NULL REFERENCES partnerships(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    
    -- コンバージョン情報
    conversion_id VARCHAR(100) NOT NULL,
    order_id VARCHAR(100),
    conversion_type ENUM('sale', 'lead', 'action', 'install') NOT NULL,
    
    -- 金額情報
    sale_amount DECIMAL(15, 2) DEFAULT 0,
    commission_amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'JPY',
    
    -- アイテム情報
    items JSONB,
    
    -- ステータス
    status ENUM('pending', 'approved', 'rejected', 'canceled') DEFAULT 'pending',
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- トラッキング情報
    sub_id1 VARCHAR(255),
    sub_id2 VARCHAR(255),
    sub_id3 VARCHAR(255),
    
    -- アクセス情報
    ip_address INET,
    user_agent TEXT,
    
    -- 不正検知
    is_suspicious BOOLEAN DEFAULT FALSE,
    fraud_score INTEGER DEFAULT 0,
    fraud_reasons JSONB,
    
    converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversions_click_id ON conversions(click_id);
CREATE INDEX idx_conversions_partnership_id ON conversions(partnership_id);
CREATE INDEX idx_conversions_program_id ON conversions(program_id);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_converted_at ON conversions(converted_at);
CREATE INDEX idx_conversions_order_id ON conversions(order_id);
```

#### 3.2.10 commissions（報酬）
```sql
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id UUID NOT NULL REFERENCES conversions(id),
    publisher_id UUID NOT NULL REFERENCES publishers(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    
    -- 報酬金額
    gross_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'JPY',
    
    -- ステータス
    status ENUM('pending', 'confirmed', 'paid', 'canceled') DEFAULT 'pending',
    
    -- 支払い情報
    payout_id UUID REFERENCES payouts(id),
    paid_at TIMESTAMP,
    
    -- 期間
    commission_period DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_conversion_id ON commissions(conversion_id);
CREATE INDEX idx_commissions_publisher_id ON commissions(publisher_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_commission_period ON commissions(commission_period);
```

#### 3.2.11 payouts（支払い）
```sql
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES publishers(id),
    
    -- 支払い情報
    payout_period DATE NOT NULL,
    gross_amount DECIMAL(15, 2) NOT NULL,
    tax_withholding DECIMAL(10, 2) DEFAULT 0,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'JPY',
    
    -- 銀行情報（支払い時点のスナップショット）
    bank_info JSONB NOT NULL,
    
    -- ステータス
    status ENUM('pending', 'processing', 'completed', 'failed', 'canceled') DEFAULT 'pending',
    
    -- 処理情報
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    transfer_reference VARCHAR(100),
    failure_reason TEXT,
    
    -- 明細
    commission_count INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_publisher_id ON payouts(publisher_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_payout_period ON payouts(payout_period);
```

#### 3.2.12 categories（カテゴリ）
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

#### 3.2.13 notifications（通知）
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 3.2.14 audit_logs（監査ログ）
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 4. API設計

### 4.1 認証API

#### POST /api/v1/auth/register
新規ユーザー登録
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "user_type": "publisher",
  "terms_accepted": true
}

// Response 201
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "message": "確認メールを送信しました"
  }
}
```

#### POST /api/v1/auth/login
ログイン
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_type": "publisher",
      "status": "active"
    }
  }
}
```

#### POST /api/v1/auth/refresh
トークン更新
```json
// Request
{
  "refresh_token": "eyJhbGc..."
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

#### POST /api/v1/auth/logout
ログアウト
```json
// Response 200
{
  "success": true,
  "message": "ログアウトしました"
}
```

#### POST /api/v1/auth/password/forgot
パスワードリセット要求
```json
// Request
{
  "email": "user@example.com"
}

// Response 200
{
  "success": true,
  "message": "パスワードリセットメールを送信しました"
}
```

#### POST /api/v1/auth/password/reset
パスワードリセット実行
```json
// Request
{
  "token": "reset_token",
  "password": "NewSecurePassword123!",
  "password_confirmation": "NewSecurePassword123!"
}

// Response 200
{
  "success": true,
  "message": "パスワードを更新しました"
}
```

### 4.2 広告主API

#### POST /api/v1/advertisers/register
広告主登録
```json
// Request
{
  "company_name": "株式会社サンプル",
  "company_name_kana": "カブシキガイシャサンプル",
  "representative_name": "山田 太郎",
  "postal_code": "100-0001",
  "address": "東京都千代田区...",
  "phone": "03-1234-5678",
  "website_url": "https://example.com",
  "business_type": "EC",
  "description": "会社概要..."
}

// Response 201
{
  "success": true,
  "data": {
    "advertiser_id": "uuid",
    "status": "pending_review",
    "message": "審査をお待ちください"
  }
}
```

#### GET /api/v1/advertisers/me
広告主情報取得
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_name": "株式会社サンプル",
    "status": "approved",
    "contract_type": "prepaid",
    "current_balance": 100000,
    "credit_limit": 500000
    // ... その他のフィールド
  }
}
```

#### PUT /api/v1/advertisers/me
広告主情報更新
```json
// Request
{
  "company_name": "株式会社サンプル（更新）",
  "phone": "03-9876-5432"
}

// Response 200
{
  "success": true,
  "data": {
    // 更新後のデータ
  }
}
```

### 4.3 アフィリエイターAPI

#### POST /api/v1/publishers/register
アフィリエイター登録
```json
// Request
{
  "publisher_type": "individual",
  "first_name": "太郎",
  "last_name": "山田",
  "first_name_kana": "タロウ",
  "last_name_kana": "ヤマダ",
  "date_of_birth": "1990-01-01",
  "postal_code": "100-0001",
  "address": "東京都千代田区...",
  "phone": "090-1234-5678"
}

// Response 201
{
  "success": true,
  "data": {
    "publisher_id": "uuid",
    "status": "pending_review"
  }
}
```

#### POST /api/v1/publishers/sites
メディアサイト登録
```json
// Request
{
  "site_name": "サンプルブログ",
  "site_url": "https://blog.example.com",
  "site_type": "blog",
  "category_id": "uuid",
  "description": "サイト説明...",
  "monthly_pv": 10000
}

// Response 201
{
  "success": true,
  "data": {
    "site_id": "uuid",
    "status": "pending_review"
  }
}
```

#### GET /api/v1/publishers/sites
メディアサイト一覧取得
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "site_name": "サンプルブログ",
      "site_url": "https://blog.example.com",
      "status": "approved"
    }
  ]
}
```

#### PUT /api/v1/publishers/bank-account
銀行口座登録・更新
```json
// Request
{
  "bank_name": "三菱UFJ銀行",
  "bank_code": "0005",
  "branch_name": "本店",
  "branch_code": "001",
  "account_type": "ordinary",
  "account_number": "1234567",
  "account_holder_name": "ヤマダ タロウ"
}

// Response 200
{
  "success": true,
  "message": "銀行口座情報を更新しました"
}
```

### 4.4 プログラムAPI

#### POST /api/v1/programs
プログラム作成（広告主用）
```json
// Request
{
  "program_name": "サンプル商品アフィリエイト",
  "description": "商品説明...",
  "promotion_text": "PR文...",
  "category_id": "uuid",
  "landing_page_url": "https://example.com/lp",
  "commission_type": "cpa",
  "commission_amount": 1000,
  "cookie_duration_days": 30,
  "conversion_conditions": "商品購入完了",
  "denied_conditions": "キャンセル・返品"
}

// Response 201
{
  "success": true,
  "data": {
    "program_id": "uuid",
    "program_code": "PRG12345",
    "status": "draft"
  }
}
```

#### GET /api/v1/programs
プログラム一覧取得
```json
// Query Parameters
// ?category_id=uuid&status=active&sort=commission_amount&order=desc&page=1&limit=20

// Response 200
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "uuid",
        "program_name": "サンプル商品アフィリエイト",
        "advertiser": {
          "id": "uuid",
          "company_name": "株式会社サンプル"
        },
        "commission_type": "cpa",
        "commission_amount": 1000,
        "cookie_duration_days": 30,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

#### GET /api/v1/programs/:id
プログラム詳細取得
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "program_name": "サンプル商品アフィリエイト",
    "description": "...",
    "creatives": [
      {
        "id": "uuid",
        "creative_type": "banner",
        "image_url": "https://...",
        "width": 300,
        "height": 250
      }
    ],
    // ... その他のフィールド
  }
}
```

#### POST /api/v1/programs/:id/creatives
クリエイティブ追加
```json
// Request
{
  "creative_type": "banner",
  "creative_name": "300x250バナー",
  "image_url": "https://cdn.example.com/banner.jpg",
  "width": 300,
  "height": 250,
  "alt_text": "商品バナー",
  "destination_url": "https://example.com/lp?utm_source=affiliate"
}

// Response 201
{
  "success": true,
  "data": {
    "creative_id": "uuid"
  }
}
```

### 4.5 提携API

#### POST /api/v1/partnerships/apply
提携申請（アフィリエイター用）
```json
// Request
{
  "program_id": "uuid",
  "site_id": "uuid",
  "message": "提携希望理由..."
}

// Response 201
{
  "success": true,
  "data": {
    "partnership_id": "uuid",
    "status": "pending"
  }
}
```

#### GET /api/v1/partnerships
提携一覧取得
```json
// Response 200
{
  "success": true,
  "data": {
    "partnerships": [
      {
        "id": "uuid",
        "program": {
          "id": "uuid",
          "program_name": "サンプル商品アフィリエイト"
        },
        "status": "approved",
        "affiliate_code": "AFF123456",
        "tracking_url": "https://track.example.com/c/AFF123456",
        "total_clicks": 1500,
        "total_conversions": 45,
        "total_earnings": 45000
      }
    ]
  }
}
```

#### GET /api/v1/partnerships/:id/links
アフィリエイトリンク取得
```json
// Response 200
{
  "success": true,
  "data": {
    "base_url": "https://track.example.com/c/AFF123456",
    "creatives": [
      {
        "creative_id": "uuid",
        "creative_name": "300x250バナー",
        "creative_type": "banner",
        "tracking_url": "https://track.example.com/c/AFF123456?cid=uuid",
        "html_code": "<a href=\"...\"><img src=\"...\" /></a>"
      }
    ],
    "text_link": {
      "url": "https://track.example.com/c/AFF123456",
      "example": "<a href=\"https://track.example.com/c/AFF123456\">商品名</a>"
    }
  }
}
```

#### PUT /api/v1/partnerships/:id/review
提携審査（広告主用）
```json
// Request
{
  "action": "approve", // or "reject"
  "rejection_reason": "理由..." // reject時のみ
}

// Response 200
{
  "success": true,
  "data": {
    "partnership_id": "uuid",
    "status": "approved"
  }
}
```

### 4.6 トラッキングAPI

#### GET /track/click/:affiliate_code
クリックトラッキング（リダイレクト）
```
// Query Parameters
// ?cid=creative_id&sub1=value&sub2=value...

// Response 302
// Location: https://example.com/lp
// Set-Cookie: aff_click=click_id; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax
```

#### POST /api/v1/tracking/conversion
コンバージョン通知（広告主サーバーから）
```json
// Request
{
  "program_code": "PRG12345",
  "order_id": "ORD-12345",
  "sale_amount": 5000,
  "conversion_type": "sale",
  "items": [
    {
      "product_id": "PROD001",
      "name": "商品A",
      "quantity": 1,
      "price": 5000
    }
  ],
  "customer_id": "CUST001" // オプション
}

// Response 200
{
  "success": true,
  "data": {
    "conversion_id": "uuid",
    "status": "pending"
  }
}
```

#### GET /api/v1/tracking/pixel.gif
トラッキングピクセル（画像タグ方式）
```
// Query Parameters
// ?program_code=PRG12345&order_id=ORD-12345&amount=5000

// Response 200
// Content-Type: image/gif
// 1x1 transparent GIF
```

### 4.7 レポートAPI

#### GET /api/v1/reports/summary
サマリーレポート
```json
// Query Parameters
// ?start_date=2024-01-01&end_date=2024-01-31&group_by=day

// Response 200
{
  "success": true,
  "data": {
    "summary": {
      "total_clicks": 50000,
      "total_conversions": 1500,
      "total_commission": 1500000,
      "conversion_rate": 3.0,
      "epc": 30 // Earnings Per Click
    },
    "daily_data": [
      {
        "date": "2024-01-01",
        "clicks": 1600,
        "conversions": 48,
        "commission": 48000
      }
    ]
  }
}
```

#### GET /api/v1/reports/programs
プログラム別レポート（アフィリエイター用）
```json
// Response 200
{
  "success": true,
  "data": {
    "programs": [
      {
        "program_id": "uuid",
        "program_name": "サンプル商品アフィリエイト",
        "clicks": 5000,
        "conversions": 150,
        "pending_commission": 50000,
        "confirmed_commission": 100000,
        "paid_commission": 80000
      }
    ]
  }
}
```

#### GET /api/v1/reports/publishers
パブリッシャー別レポート（広告主用）
```json
// Response 200
{
  "success": true,
  "data": {
    "publishers": [
      {
        "publisher_id": "uuid",
        "site_name": "サンプルブログ",
        "clicks": 2000,
        "conversions": 60,
        "commission": 60000,
        "conversion_rate": 3.0
      }
    ]
  }
}
```

#### GET /api/v1/reports/conversions
コンバージョン詳細レポート
```json
// Query Parameters
// ?start_date=2024-01-01&end_date=2024-01-31&status=all&page=1&limit=50

// Response 200
{
  "success": true,
  "data": {
    "conversions": [
      {
        "id": "uuid",
        "order_id": "ORD-12345",
        "program_name": "サンプル商品アフィリエイト",
        "sale_amount": 5000,
        "commission_amount": 1000,
        "status": "approved",
        "converted_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 50
    }
  }
}
```

### 4.8 支払いAPI

#### GET /api/v1/payments/balance
残高照会（アフィリエイター用）
```json
// Response 200
{
  "success": true,
  "data": {
    "pending_amount": 50000,
    "confirmed_amount": 100000,
    "payable_amount": 80000,
    "paid_amount": 500000,
    "minimum_payout": 5000,
    "next_payout_date": "2024-02-15"
  }
}
```

#### GET /api/v1/payments/history
支払い履歴
```json
// Response 200
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "payout_period": "2024-01",
        "gross_amount": 100000,
        "tax_withholding": 10210,
        "net_amount": 89790,
        "status": "completed",
        "paid_at": "2024-02-15T10:00:00Z"
      }
    ]
  }
}
```

#### GET /api/v1/payments/:id/details
支払い明細
```json
// Response 200
{
  "success": true,
  "data": {
    "payout": {
      "id": "uuid",
      "payout_period": "2024-01",
      "gross_amount": 100000,
      "tax_withholding": 10210,
      "platform_fee": 0,
      "net_amount": 89790,
      "status": "completed"
    },
    "commissions": [
      {
        "program_name": "サンプル商品アフィリエイト",
        "conversion_count": 50,
        "amount": 50000
      }
    ]
  }
}
```

### 4.9 管理者API

#### GET /api/v1/admin/users
ユーザー一覧
```json
// Query Parameters
// ?user_type=publisher&status=pending_review&page=1&limit=20

// Response 200
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...}
  }
}
```

#### PUT /api/v1/admin/advertisers/:id/review
広告主審査
```json
// Request
{
  "action": "approve", // or "reject"
  "rejection_reason": "理由..."
}

// Response 200
{
  "success": true,
  "message": "審査が完了しました"
}
```

#### PUT /api/v1/admin/publishers/:id/review
アフィリエイター審査
```json
// Request
{
  "action": "approve",
  "rank": "silver"
}

// Response 200
{
  "success": true,
  "message": "審査が完了しました"
}
```

#### PUT /api/v1/admin/programs/:id/review
プログラム審査
```json
// Request
{
  "action": "approve"
}

// Response 200
{
  "success": true,
  "message": "プログラムを承認しました"
}
```

#### POST /api/v1/admin/payouts/process
支払い処理実行
```json
// Request
{
  "payout_period": "2024-01",
  "publisher_ids": ["uuid1", "uuid2"] // オプション、指定しない場合は全員
}

// Response 200
{
  "success": true,
  "data": {
    "processed_count": 100,
    "total_amount": 5000000
  }
}
```

#### GET /api/v1/admin/dashboard
管理者ダッシュボード
```json
// Response 200
{
  "success": true,
  "data": {
    "overview": {
      "total_advertisers": 500,
      "total_publishers": 10000,
      "total_programs": 800,
      "active_programs": 650
    },
    "pending_reviews": {
      "advertisers": 10,
      "publishers": 25,
      "programs": 5,
      "sites": 30
    },
    "financials": {
      "mtd_revenue": 5000000,
      "mtd_commission": 4000000,
      "pending_payouts": 2000000
    },
    "recent_activity": [...]
  }
}
```

---

## 5. トラッキングシステム設計

### 5.1 クリックトラッキングフロー
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────>│  Tracking   │────>│  Advertiser │
│   Browser   │     │   Server    │     │   Site      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │  1. Click Link    │
       │──────────────────>│
       │                   │
       │                   │ 2. Record Click
       │                   │ 3. Generate Click ID
       │                   │ 4. Set Cookie
       │                   │
       │  5. 302 Redirect  │
       │<──────────────────│
       │                   │
       │  6. Load LP       │
       │──────────────────────────────────>│
```

### 5.2 コンバージョントラッキング方式

#### 5.2.1 サーバー間通信（S2S）- 推奨
```javascript
// 広告主サーバー側実装例
async function notifyConversion(orderData) {
  const response = await fetch('https://api.asp.example.com/v1/tracking/conversion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ASP_API_KEY
    },
    body: JSON.stringify({
      program_code: 'PRG12345',
      order_id: orderData.orderId,
      sale_amount: orderData.totalAmount,
      conversion_type: 'sale',
      items: orderData.items
    })
  });
  return response.json();
}
```

#### 5.2.2 JavaScriptタグ方式
```html
<!-- サンクスページに設置 -->
<script>
  (function() {
    var img = new Image();
    img.src = 'https://track.asp.example.com/conversion' +
      '?program_code=PRG12345' +
      '&order_id=' + encodeURIComponent('ORDER_ID') +
      '&amount=' + encodeURIComponent('AMOUNT') +
      '&_=' + Date.now();
  })();
</script>
```

#### 5.2.3 ピクセルタグ方式
```html
<!-- サンクスページに設置 -->
<img src="https://track.asp.example.com/pixel.gif?program_code=PRG12345&order_id=ORDER_ID&amount=AMOUNT" 
     width="1" height="1" style="display:none;" />
```

### 5.3 Cookieストラテジー
```javascript
// Cookie設定
const COOKIE_CONFIG = {
  name: 'aff_tracking',
  maxAge: 30 * 24 * 60 * 60, // 30日
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  domain: '.example.com'
};

// Cookie構造
interface TrackingCookie {
  click_id: string;
  affiliate_code: string;
  program_id: string;
  clicked_at: number;
  sub_ids: {
    sub1?: string;
    sub2?: string;
    sub3?: string;
  };
}
```

### 5.4 アトリビューションモデル
```typescript
enum AttributionModel {
  LAST_CLICK = 'last_click',      // 最終クリック（デフォルト）
  FIRST_CLICK = 'first_click',    // 最初のクリック
  LINEAR = 'linear'               // 均等配分
}

// アトリビューション処理
async function attributeConversion(
  orderId: string,
  programId: string,
  model: AttributionModel
): Promise<Attribution[]> {
  const clicks = await getClicksForOrder(orderId, programId);
  
  switch (model) {
    case AttributionModel.LAST_CLICK:
      return [{ clickId: clicks[clicks.length - 1].id, weight: 1.0 }];
    
    case AttributionModel.FIRST_CLICK:
      return [{ clickId: clicks[0].id, weight: 1.0 }];
    
    case AttributionModel.LINEAR:
      const weight = 1.0 / clicks.length;
      return clicks.map(c => ({ clickId: c.id, weight }));
  }
}
```

### 5.5 不正検知システム

#### 5.5.1 検知ルール
```typescript
interface FraudRule {
  id: string;
  name: string;
  type: 'click' | 'conversion';
  check: (data: TrackingData) => FraudCheckResult;
}

const fraudRules: FraudRule[] = [
  {
    id: 'rapid_clicks',
    name: '連続クリック検知',
    type: 'click',
    check: async (data) => {
      const recentClicks = await getRecentClicksFromIP(data.ip, 60); // 1分以内
      if (recentClicks > 5) {
        return { suspicious: true, score: 80, reason: '同一IPから短時間に多数のクリック' };
      }
      return { suspicious: false, score: 0 };
    }
  },
  {
    id: 'datacenter_ip',
    name: 'データセンターIP検知',
    type: 'click',
    check: async (data) => {
      const isDatacenter = await checkDatacenterIP(data.ip);
      if (isDatacenter) {
        return { suspicious: true, score: 60, reason: 'データセンターIPからのアクセス' };
      }
      return { suspicious: false, score: 0 };
    }
  },
  {
    id: 'click_conversion_mismatch',
    name: 'クリック・CV不一致',
    type: 'conversion',
    check: async (data) => {
      if (!data.clickId) {
        return { suspicious: true, score: 50, reason: '関連クリックなし' };
      }
      const click = await getClick(data.clickId);
      if (click.ip !== data.ip) {
        return { suspicious: true, score: 30, reason: 'クリック時とCV時のIPが異なる' };
      }
      return { suspicious: false, score: 0 };
    }
  },
  {
    id: 'abnormal_conversion_rate',
    name: '異常CV率検知',
    type: 'conversion',
    check: async (data) => {
      const stats = await getPartnershipStats(data.partnershipId, 24); // 24時間
      const cvr = stats.conversions / stats.clicks;
      if (cvr > 0.5) { // 50%以上は異常
        return { suspicious: true, score: 70, reason: '異常に高いCV率' };
      }
      return { suspicious: false, score: 0 };
    }
  }
];
```

#### 5.5.2 フィンガープリント
```typescript
interface DeviceFingerprint {
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  plugins: string[];
  canvas: string;
  webgl: string;
}

function generateFingerprintHash(fp: DeviceFingerprint): string {
  const data = JSON.stringify(fp);
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

---

## 6. フロントエンド画面設計

### 6.1 共通ページ

#### 6.1.1 ランディングページ
- サービス概要
- 広告主向けメリット
- アフィリエイター向けメリット
- 導入実績・事例
- 料金プラン
- FAQ
- 会員登録CTA

#### 6.1.2 ログインページ
- メールアドレス/パスワード入力
- パスワードを忘れた場合リンク
- 新規登録リンク
- 2段階認証入力（有効時）

#### 6.1.3 会員登録ページ
- ユーザータイプ選択（広告主/アフィリエイター）
- 基本情報入力フォーム
- 利用規約同意

### 6.2 広告主ダッシュボード

#### 6.2.1 ダッシュボードトップ
```
┌─────────────────────────────────────────────────────────────────┐
│ ダッシュボード                                     [通知] [設定] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   残高      │ │  今月の     │ │  今月の     │ │  今月の     │ │
│ │ ¥500,000   │ │  クリック   │ │  CV         │ │  報酬       │ │
│ │            │ │   15,234    │ │    456      │ │  ¥456,000  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [パフォーマンスグラフ - 日別推移]                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                         📈                                  │ │
│ │     ──────────────────────────────                         │ │
│ │    /                              \                        │ │
│ │   /                                ────                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ 最近の提携申請                                     [すべて見る] │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ サイト名        │ プログラム      │ 申請日     │ アクション │ │
│ │ ブログA         │ 商品A案件       │ 2024/01/15 │ [審査]    │ │
│ │ サイトB         │ 商品B案件       │ 2024/01/14 │ [審査]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.2.2 プログラム管理
- プログラム一覧
- プログラム作成/編集
  - 基本情報
  - 報酬設定
  - Cookie設定
  - 成果条件
  - クリエイティブ管理
- プログラムステータス管理

#### 6.2.3 提携管理
- 提携申請一覧
- 提携中アフィリエイター一覧
- 提携審査画面
- 特別単価設定

#### 6.2.4 成果管理
- コンバージョン一覧
- 成果承認/否認
- 成果詳細

#### 6.2.5 レポート
- サマリーレポート
- プログラム別レポート
- アフィリエイター別レポート
- 日別/月別レポート
- CSV/Excelエクスポート

#### 6.2.6 請求・支払い
- 残高照会
- 入金履歴
- 請求書一覧
- 入金（チャージ）

### 6.3 アフィリエイターダッシュボード

#### 6.3.1 ダッシュボードトップ
```
┌─────────────────────────────────────────────────────────────────┐
│ ダッシュボード                                     [通知] [設定] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │  未確定     │ │  確定済み   │ │  支払い     │ │  今月の     │ │
│ │  報酬      │ │  報酬       │ │  可能額     │ │  クリック   │ │
│ │ ¥50,000   │ │ ¥100,000   │ │  ¥80,000   │ │   5,234    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ あなたにおすすめのプログラム                       [もっと見る] │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [💊] 健康食品A    │ [📱] アプリB     │ [🎮] ゲームC      │   │
│ │ CPA: ¥3,000     │ CPI: ¥500       │ CPA: ¥1,000      │   │
│ │ [提携申請]       │ [提携申請]       │ [提携申請]        │   │
│ └───────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ 最近の成果                                        [すべて見る]  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 日時            │ プログラム    │ 報酬      │ ステータス   │ │
│ │ 2024/01/15 10:30│ 商品A案件    │ ¥1,000   │ 承認待ち    │ │
│ │ 2024/01/15 09:15│ 商品B案件    │ ¥500     │ 確定       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.3.2 プログラム検索
- カテゴリ検索
- キーワード検索
- 条件フィルター
  - 報酬タイプ
  - 報酬額
  - 承認率
  - EPC
- プログラム詳細
- 提携申請

#### 6.3.3 提携プログラム管理
- 提携中プログラム一覧
- 広告素材取得
- アフィリエイトリンク生成
- リンク作成ツール
  - URL生成
  - バナー取得
  - テキストリンク作成
  - 商品リンク作成

#### 6.3.4 メディアサイト管理
- サイト一覧
- サイト登録/編集
- サイト審査状況

#### 6.3.5 レポート
- サマリーレポート
- プログラム別レポート
- サイト別レポート
- クリック分析
- コンバージョン分析

#### 6.3.6 報酬・支払い
- 報酬履歴
- 支払い履歴
- 支払い予定
- 銀行口座設定

### 6.4 管理者ダッシュボード

#### 6.4.1 ダッシュボードトップ
- システム統計
- 審査待ち件数
- 今月の売上/手数料
- アラート/通知

#### 6.4.2 ユーザー管理
- 広告主一覧/審査
- アフィリエイター一覧/審査
- ユーザー詳細/編集
- アカウント停止/復活

#### 6.4.3 プログラム管理
- プログラム一覧/審査
- プログラム詳細
- 強制停止/復活

#### 6.4.4 成果管理
- 全成果一覧
- 不正疑い案件
- 一括承認/否認

#### 6.4.5 支払い管理
- 支払いバッチ実行
- 支払い履歴
- 振込ファイル生成

#### 6.4.6 レポート
- 全体統計
- 広告主別分析
- アフィリエイター別分析
- 不正検知レポート

#### 6.4.7 システム設定
- カテゴリ管理
- 手数料設定
- メール設定
- 通知設定

---

## 7. セキュリティ設計

### 7.1 認証・認可

#### 7.1.1 JWT設定
```typescript
// JWT設定
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '1h'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d'
  }
};

// JWTペイロード
interface JWTPayload {
  sub: string;          // user_id
  email: string;
  user_type: 'admin' | 'advertiser' | 'publisher';
  permissions: string[];
  iat: number;
  exp: number;
}
```

#### 7.1.2 RBAC（ロールベースアクセス制御）
```typescript
// 権限定義
enum Permission {
  // 広告主権限
  PROGRAM_CREATE = 'program:create',
  PROGRAM_UPDATE = 'program:update',
  PROGRAM_DELETE = 'program:delete',
  PARTNERSHIP_REVIEW = 'partnership:review',
  CONVERSION_REVIEW = 'conversion:review',
  
  // アフィリエイター権限
  PROGRAM_VIEW = 'program:view',
  PARTNERSHIP_APPLY = 'partnership:apply',
  SITE_MANAGE = 'site:manage',
  
  // 管理者権限
  USER_MANAGE = 'user:manage',
  SYSTEM_CONFIG = 'system:config',
  PAYOUT_PROCESS = 'payout:process'
}

// ロール定義
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission),
  advertiser: [
    Permission.PROGRAM_CREATE,
    Permission.PROGRAM_UPDATE,
    Permission.PROGRAM_DELETE,
    Permission.PARTNERSHIP_REVIEW,
    Permission.CONVERSION_REVIEW
  ],
  publisher: [
    Permission.PROGRAM_VIEW,
    Permission.PARTNERSHIP_APPLY,
    Permission.SITE_MANAGE
  ]
};
```

#### 7.1.3 2段階認証
```typescript
// TOTP設定
const TOTP_CONFIG = {
  issuer: 'ASP Platform',
  algorithm: 'SHA1',
  digits: 6,
  period: 30
};

// 2FA有効化フロー
async function enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = generateSecret();
  const otpauth = `otpauth://totp/${TOTP_CONFIG.issuer}:${email}?secret=${secret}&issuer=${TOTP_CONFIG.issuer}`;
  const qrCode = await QRCode.toDataURL(otpauth);
  
  await saveTemporary2FASecret(userId, secret);
  return { secret, qrCode };
}

async function verify2FA(userId: string, token: string): Promise<boolean> {
  const secret = await get2FASecret(userId);
  return verifyTOTP(token, secret);
}
```

### 7.2 APIセキュリティ

#### 7.2.1 レート制限
```typescript
// レート制限設定
const RATE_LIMITS = {
  // 認証API
  auth: {
    windowMs: 15 * 60 * 1000, // 15分
    max: 10 // 10回まで
  },
  // 一般API
  api: {
    windowMs: 60 * 1000, // 1分
    max: 100 // 100回まで
  },
  // トラッキングAPI
  tracking: {
    windowMs: 1000, // 1秒
    max: 1000 // 1000回まで（高負荷対応）
  }
};
```

#### 7.2.2 入力検証
```typescript
// Zodスキーマ例
const programCreateSchema = z.object({
  program_name: z.string().min(1).max(255),
  description: z.string().max(10000).optional(),
  landing_page_url: z.string().url(),
  commission_type: z.enum(['cpa', 'cpc', 'cpm', 'hybrid']),
  commission_amount: z.number().positive().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  cookie_duration_days: z.number().int().min(1).max(365).default(30)
});
```

#### 7.2.3 SQLインジェクション対策
- ORMの使用（Prisma/TypeORM）
- パラメータ化クエリの使用
- 入力値のサニタイズ

#### 7.2.4 XSS対策
- Content Security Policy (CSP)ヘッダー
- 出力エスケープ
- HttpOnly Cookie

### 7.3 データ保護

#### 7.3.1 暗号化
```typescript
// パスワードハッシュ化
const PASSWORD_CONFIG = {
  algorithm: 'argon2id',
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
};

// 機密データ暗号化
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'HKDF-SHA256'
};

// 銀行口座情報の暗号化例
async function encryptBankInfo(data: BankInfo): Promise<string> {
  const key = await deriveKey(process.env.ENCRYPTION_KEY);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

#### 7.3.2 PII（個人情報）保護
- マイナンバーの取り扱い規定準拠
- アクセスログの記録
- データ最小化原則

### 7.4 監査・ログ

#### 7.4.1 監査ログ
```typescript
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: object;
  new_values: object;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

// 監査ログ記録
async function logAuditEvent(event: AuditEvent): Promise<void> {
  await db.auditLogs.create({
    data: {
      user_id: event.userId,
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId,
      old_values: event.oldValues,
      new_values: event.newValues,
      ip_address: event.ipAddress,
      user_agent: event.userAgent
    }
  });
}
```

#### 7.4.2 セキュリティアラート
- 不審なログイン検知
- 大量のAPI呼び出し検知
- 不正なコンバージョンパターン検知

---

## 8. インフラ設計

### 8.1 AWS構成例
```
┌─────────────────────────────────────────────────────────────────┐
│                         Route 53                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront                                │
└─────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
┌───────────────────────────┐  ┌───────────────────────────┐
│   ALB (Application)       │  │   ALB (Tracking)          │
└───────────────────────────┘  └───────────────────────────┘
          │                              │
┌───────────────────────────┐  ┌───────────────────────────┐
│   ECS Cluster (Fargate)   │  │   ECS Cluster (Fargate)   │
│   - Web Service           │  │   - Tracking Service      │
│   - API Service           │  │   (Auto Scaling)          │
│   - Worker Service        │  │                           │
└───────────────────────────┘  └───────────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
┌─────────────────────────────────────────────────────────────────┐
│                      VPC Private Subnet                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Aurora      │  │ ElastiCache │  │ OpenSearch  │              │
│  │ PostgreSQL  │  │ (Redis)     │  │             │              │
│  │ (Multi-AZ)  │  │ (Cluster)   │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────────┐
│   S3 (Static Assets, Creatives, Backups)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 スケーリング設計

#### 8.2.1 水平スケーリング
```yaml
# ECS Service Auto Scaling
Resources:
  TrackingServiceScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MinCapacity: 2
      MaxCapacity: 50
      ResourceId: !Sub service/${ECSCluster}/${TrackingService}
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  TrackingServiceScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: TrackingServiceCPUScaling
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref TrackingServiceScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        TargetValue: 70
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        ScaleInCooldown: 60
        ScaleOutCooldown: 60
```

#### 8.2.2 データベーススケーリング
```yaml
# Aurora Auto Scaling
Resources:
  AuroraCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineVersion: '15.4'
      ServerlessV2ScalingConfiguration:
        MinCapacity: 2
        MaxCapacity: 64
      EnableHttpEndpoint: true
```

### 8.3 監視・アラート

#### 8.3.1 CloudWatchメトリクス
```yaml
# カスタムメトリクス
Metrics:
  - ClicksPerMinute
  - ConversionsPerMinute
  - APILatencyP99
  - ErrorRate
  - QueueDepth
  - FraudDetectionRate
```

#### 8.3.2 アラート設定
```yaml
Alarms:
  - Name: HighErrorRate
    Metric: ErrorRate
    Threshold: 5
    Period: 300
    EvaluationPeriods: 2
    Action: SNS -> PagerDuty

  - Name: HighLatency
    Metric: APILatencyP99
    Threshold: 2000  # 2秒
    Period: 60
    EvaluationPeriods: 5
    Action: SNS -> Slack

  - Name: DatabaseCPUHigh
    Metric: CPUUtilization
    Namespace: AWS/RDS
    Threshold: 80
    Action: SNS -> Slack
```

### 8.4 DR（災害復旧）設計

#### 8.4.1 バックアップ戦略
```yaml
Backup:
  Database:
    Type: Aurora Automated Backup
    RetentionPeriod: 35 days
    CrossRegion: true
    TargetRegion: ap-southeast-1
  
  S3:
    Type: Cross-Region Replication
    TargetRegion: ap-southeast-1
    
  Configuration:
    Type: AWS Backup
    Schedule: daily
    RetentionPeriod: 90 days
```

#### 8.4.2 RTO/RPO
- RPO（目標復旧時点）: 1時間
- RTO（目標復旧時間）: 4時間

---

## 9. 決済・請求システム

### 9.1 広告主への請求フロー
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  成果発生   │────>│  月次集計   │────>│  請求書    │
└─────────────┘     └─────────────┘     │  発行      │
                                        └─────────────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│  入金確認   │<────│  請求書    │<───────────┘
│             │     │  送付      │
└─────────────┘     └─────────────┘
```

### 9.2 アフィリエイターへの支払いフロー
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  成果承認   │────>│  報酬確定   │────>│  支払い    │
└─────────────┘     └─────────────┘     │  対象確定  │
                                        └─────────────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│  振込実行   │<────│  振込データ │<───────────┘
│             │     │  生成      │
└─────────────┘     └─────────────┘
```

### 9.3 手数料モデル
```typescript
interface FeeModel {
  // システム手数料（成果報酬に対する割合）
  systemFeeRate: number;  // 例: 30% (広告主が支払う報酬の30%がプラットフォーム収益)
  
  // 振込手数料
  transferFee: {
    domestic: {
      sameBank: number;      // 同一銀行: 0円
      otherBank: number;     // 他行: 330円
    };
  };
  
  // 最低支払い金額
  minimumPayout: number;    // 例: 5,000円
  
  // 源泉徴収
  withholdingTax: {
    rate: number;           // 10.21%
    threshold: number;      // 100万円超は20.42%
  };
}
```

### 9.4 全銀フォーマット出力
```typescript
// 全銀フォーマット（固定長120バイト）
interface ZenginRecord {
  recordType: string;        // 1: ヘッダー, 2: データ, 8: トレーラー, 9: エンド
  bankCode: string;          // 銀行コード（4桁）
  branchCode: string;        // 支店コード（3桁）
  accountType: string;       // 1: 普通, 2: 当座
  accountNumber: string;     // 口座番号（7桁）
  accountHolder: string;     // 口座名義（カナ30文字）
  amount: number;            // 金額（10桁）
  // ...
}

function generateZenginFile(payouts: Payout[]): Buffer {
  const records: string[] = [];
  
  // ヘッダーレコード
  records.push(generateHeaderRecord(payouts));
  
  // データレコード
  for (const payout of payouts) {
    records.push(generateDataRecord(payout));
  }
  
  // トレーラーレコード
  records.push(generateTrailerRecord(payouts));
  
  // エンドレコード
  records.push(generateEndRecord());
  
  return Buffer.from(records.join('\r\n'), 'shift_jis');
}
```

---

## 10. 通知システム

### 10.1 通知種別
```typescript
enum NotificationType {
  // 認証関連
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  LOGIN_ALERT = 'login_alert',
  
  // 審査関連
  ADVERTISER_APPROVED = 'advertiser_approved',
  ADVERTISER_REJECTED = 'advertiser_rejected',
  PUBLISHER_APPROVED = 'publisher_approved',
  PUBLISHER_REJECTED = 'publisher_rejected',
  SITE_APPROVED = 'site_approved',
  SITE_REJECTED = 'site_rejected',
  PROGRAM_APPROVED = 'program_approved',
  
  // 提携関連
  PARTNERSHIP_APPLIED = 'partnership_applied',
  PARTNERSHIP_APPROVED = 'partnership_approved',
  PARTNERSHIP_REJECTED = 'partnership_rejected',
  
  // 成果関連
  CONVERSION_RECEIVED = 'conversion_received',
  CONVERSION_APPROVED = 'conversion_approved',
  CONVERSION_REJECTED = 'conversion_rejected',
  
  // 支払い関連
  PAYOUT_SCHEDULED = 'payout_scheduled',
  PAYOUT_COMPLETED = 'payout_completed',
  
  // その他
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  PROGRAM_UPDATE = 'program_update'
}
```

### 10.2 通知チャネル
- メール通知
- サイト内通知
- Webhookオプション

### 10.3 メールテンプレート例
```html
<!-- 提携承認通知 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>提携が承認されました</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>提携承認のお知らせ</h1>
    
    <p>{{publisher_name}} 様</p>
    
    <p>
      以下のプログラムへの提携申請が承認されました。
    </p>
    
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
      <p><strong>プログラム名:</strong> {{program_name}}</p>
      <p><strong>広告主:</strong> {{advertiser_name}}</p>
      <p><strong>報酬:</strong> {{commission_type}} {{commission_amount}}</p>
    </div>
    
    <p>
      <a href="{{dashboard_url}}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
        広告素材を取得する
      </a>
    </p>
    
    <hr>
    <p style="font-size: 12px; color: #666;">
      このメールは {{platform_name}} から自動送信されています。
    </p>
  </div>
</body>
</html>
```

---

## 11. 外部連携

### 11.1 外部API
```typescript
// 広告主向けAPI（コンバージョン送信用）
interface AdvertiserAPIEndpoints {
  // コンバージョン通知
  'POST /api/external/v1/conversions': {
    request: ConversionRequest;
    response: ConversionResponse;
  };
  
  // コンバージョン確認
  'GET /api/external/v1/conversions/:id': {
    response: ConversionDetail;
  };
  
  // バッチコンバージョン
  'POST /api/external/v1/conversions/batch': {
    request: ConversionRequest[];
    response: BatchConversionResponse;
  };
}

// APIキー認証
interface APIKeyAuth {
  header: 'X-API-Key';
  format: 'asp_live_xxxxxxxxxxxx';
}
```

### 11.2 Webhook
```typescript
// Webhook設定
interface WebhookConfig {
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
}

// Webhookペイロード
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: object;
  signature: string;  // HMAC-SHA256
}

// Webhook送信
async function sendWebhook(config: WebhookConfig, event: WebhookEvent, data: object): Promise<void> {
  const payload: WebhookPayload = {
    event: event,
    timestamp: new Date().toISOString(),
    data: data,
    signature: ''
  };
  
  payload.signature = crypto
    .createHmac('sha256', config.secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': payload.signature
    },
    body: JSON.stringify(payload)
  });
}
```

### 11.3 データフィード
```xml
<!-- 商品フィード（XML形式） -->
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <id>PROD001</id>
    <name>商品名</name>
    <description>商品説明</description>
    <url>https://example.com/product/PROD001</url>
    <image_url>https://cdn.example.com/images/PROD001.jpg</image_url>
    <price>5000</price>
    <currency>JPY</currency>
    <category>カテゴリ名</category>
    <availability>in stock</availability>
    <commission>500</commission>
  </product>
</products>
```

---

## 12. 運用・保守

### 12.1 デプロイメント

#### CI/CDパイプライン
```yaml
# GitHub Actions例
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t $ECR_REPO:$GITHUB_SHA .
      - name: Push to ECR
        run: docker push $ECR_REPO:$GITHUB_SHA

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster production \
            --service api \
            --force-new-deployment
```

### 12.2 監視項目

#### アプリケーションメトリクス
- リクエスト数/秒
- レスポンスタイム（P50, P95, P99）
- エラーレート
- アクティブユーザー数

#### ビジネスメトリクス
- クリック数/分
- コンバージョン数/時
- 不正検知率
- 承認率

#### インフラメトリクス
- CPU使用率
- メモリ使用率
- ディスク使用率
- ネットワーク帯域

### 12.3 定期バッチ処理
```typescript
// バッチジョブ一覧
const BATCH_JOBS = [
  {
    name: 'daily_stats_aggregation',
    schedule: '0 1 * * *',  // 毎日1時
    description: '日次統計集計'
  },
  {
    name: 'monthly_commission_confirmation',
    schedule: '0 0 1 * *',  // 毎月1日
    description: '月次報酬確定'
  },
  {
    name: 'monthly_payout_processing',
    schedule: '0 10 15 * *',  // 毎月15日10時
    description: '月次支払い処理'
  },
  {
    name: 'click_data_archival',
    schedule: '0 3 * * 0',  // 毎週日曜3時
    description: '古いクリックデータのアーカイブ'
  },
  {
    name: 'fraud_detection_scan',
    schedule: '*/30 * * * *',  // 30分ごと
    description: '不正検知スキャン'
  }
];
```

---

## 13. 法的要件・コンプライアンス

### 13.1 必要な法的対応
- 特定商取引法に基づく表記
- プライバシーポリシー
- 利用規約（広告主向け/アフィリエイター向け）
- Cookie使用に関する同意取得（GDPR対応時）
- マイナンバー取り扱い規定

### 13.2 税務対応
```typescript
// 源泉徴収計算
function calculateWithholding(amount: number): number {
  if (amount <= 1000000) {
    return Math.floor(amount * 0.1021);  // 10.21%
  } else {
    const base = Math.floor(1000000 * 0.1021);
    const excess = Math.floor((amount - 1000000) * 0.2042);  // 20.42%
    return base + excess;
  }
}

// 支払調書データ
interface PaymentRecord {
  publisherId: string;
  publisherName: string;
  address: string;
  myNumber?: string;  // マイナンバー（要暗号化）
  totalPayment: number;
  withholdingTax: number;
  paymentYear: number;
}
```

### 13.3 データ保持期間
| データ種別 | 保持期間 | 根拠 |
|-----------|---------|------|
| クリックログ | 3年 | 不正調査対応 |
| コンバージョンデータ | 7年 | 税務関連 |
| 支払い記録 | 10年 | 商法 |
| 監査ログ | 5年 | 内部統制 |

---

## 14. 開発ロードマップ

### Phase 1: MVP（3-4ヶ月）
- [ ] 基本認証システム
- [ ] 広告主・アフィリエイター登録
- [ ] プログラム作成・管理
- [ ] 提携申請・承認
- [ ] 基本トラッキング（クリック/CV）
- [ ] 簡易レポート
- [ ] 管理者基本機能

### Phase 2: 機能拡充（2-3ヶ月）
- [ ] 不正検知システム
- [ ] 詳細レポート
- [ ] 自動支払い処理
- [ ] メール通知システム
- [ ] クリエイティブ管理強化
- [ ] API提供

### Phase 3: 最適化・拡張（2-3ヶ月）
- [ ] パフォーマンス最適化
- [ ] 2段階認証
- [ ] Webhook連携
- [ ] 商品フィード対応
- [ ] ランク制度
- [ ] 特別単価機能

### Phase 4: エンタープライズ機能（継続）
- [ ] 高度な分析機能
- [ ] A/Bテスト機能
- [ ] マルチ通貨対応
- [ ] ホワイトラベル対応
- [ ] API v2

---

## 15. 付録

### 15.1 用語集
| 用語 | 説明 |
|------|------|
| ASP | Affiliate Service Provider - アフィリエイトサービスプロバイダ |
| CPA | Cost Per Action - 成果報酬型 |
| CPC | Cost Per Click - クリック報酬型 |
| CPM | Cost Per Mille - インプレッション報酬型（1000回表示あたり） |
| CV | Conversion - コンバージョン（成果） |
| CVR | Conversion Rate - コンバージョン率 |
| EPC | Earnings Per Click - クリックあたり収益 |
| LP | Landing Page - ランディングページ |
| S2S | Server to Server - サーバー間通信 |

### 15.2 ステータス遷移図

#### プログラムステータス
```
[draft] → [pending_review] → [active] ⇄ [paused] → [ended]
                          ↘ [rejected]
```

#### 提携ステータス
```
[pending] → [approved] → [terminated]
         ↘ [rejected]
```

#### コンバージョンステータス
```
[pending] → [approved] → [paid]
         ↘ [rejected]
         ↘ [canceled]
```

### 15.3 エラーコード一覧
| コード | 説明 |
|--------|------|
| AUTH001 | 認証失敗 |
| AUTH002 | トークン期限切れ |
| AUTH003 | 権限不足 |
| USER001 | ユーザー未発見 |
| USER002 | ユーザー停止中 |
| PROG001 | プログラム未発見 |
| PROG002 | プログラム非公開 |
| PART001 | 提携未発見 |
| PART002 | 提携未承認 |
| CONV001 | コンバージョン重複 |
| CONV002 | 無効なクリック |
| PAY001 | 残高不足 |
| PAY002 | 最低支払い金額未達 |

---

## 16. 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2024-XX-XX | 初版作成 |

---

**本仕様書は、生成AIによるシステム構築の参考資料として作成されました。実装時には、各種法令・規制の最新情報を確認し、セキュリティ専門家によるレビューを受けることを推奨します。**
