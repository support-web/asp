import { Suspense } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { Search, Filter, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Demo data - in real app, fetch from API
const categories = [
  { id: '1', name: 'EC・通販', slug: 'ec', count: 150 },
  { id: '2', name: '金融・投資', slug: 'finance', count: 85 },
  { id: '3', name: '美容・健康', slug: 'beauty', count: 120 },
  { id: '4', name: '教育・スクール', slug: 'education', count: 65 },
  { id: '5', name: '旅行・レジャー', slug: 'travel', count: 45 },
  { id: '6', name: 'IT・通信', slug: 'it', count: 90 },
]

const programs = [
  {
    id: '1',
    name: 'サンプルECサイト',
    advertiser: '株式会社サンプル',
    description: '高品質な商品を取り扱う総合ECサイト。幅広いジャンルの商品があり、CVRが高いのが特徴です。',
    category: 'EC・通販',
    commissionType: 'cpa',
    commissionAmount: 1000,
    cookieDays: 30,
    epc: 45,
    cvr: 3.2,
  },
  {
    id: '2',
    name: 'オンライン英会話スクール',
    advertiser: 'ABC英会話株式会社',
    description: 'マンツーマンのオンライン英会話。無料体験から有料会員への転換率が高いです。',
    category: '教育・スクール',
    commissionType: 'cpa',
    commissionAmount: 5000,
    cookieDays: 60,
    epc: 120,
    cvr: 2.4,
  },
  {
    id: '3',
    name: '美容サプリメント定期購入',
    advertiser: 'ビューティーラボ株式会社',
    description: '人気の美容サプリメント。定期購入で高額報酬が得られます。',
    category: '美容・健康',
    commissionType: 'cpa',
    commissionAmount: 3000,
    cookieDays: 45,
    epc: 85,
    cvr: 2.8,
  },
  {
    id: '4',
    name: '格安SIM比較サイト',
    advertiser: 'モバイル比較株式会社',
    description: '各社格安SIMの比較・申込サイト。MNP申込で報酬発生。',
    category: 'IT・通信',
    commissionType: 'cpa',
    commissionAmount: 2500,
    cookieDays: 30,
    epc: 65,
    cvr: 2.6,
  },
  {
    id: '5',
    name: '投資信託口座開設',
    advertiser: '〇〇証券株式会社',
    description: 'ネット証券の口座開設プログラム。初回入金で報酬発生。',
    category: '金融・投資',
    commissionType: 'cpa',
    commissionAmount: 8000,
    cookieDays: 90,
    epc: 180,
    cvr: 2.2,
  },
  {
    id: '6',
    name: '旅行予約サイト',
    advertiser: 'トラベル株式会社',
    description: '国内・海外旅行の予約サイト。予約金額に応じた報酬。',
    category: '旅行・レジャー',
    commissionType: 'hybrid',
    commissionAmount: 500,
    commissionRate: 3,
    cookieDays: 30,
    epc: 55,
    cvr: 1.8,
  },
]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900">プログラム一覧</h1>
            <p className="mt-2 text-gray-600">
              豊富なジャンルから、あなたのサイトに合った広告プログラムを見つけましょう
            </p>

            {/* Search */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="プログラム名、広告主名で検索..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">カテゴリ</h3>
                  <ul className="space-y-1">
                    <li>
                      <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm font-medium bg-primary-50 text-primary-700">
                        <span>すべて</span>
                        <span className="text-xs">555</span>
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm text-gray-600 hover:bg-gray-50">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400">{category.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* CTA for non-logged in users */}
              <Card className="mt-6 bg-primary-50 border-primary-200">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-primary-900">アフィリエイトを始めよう</h3>
                  <p className="mt-2 text-sm text-primary-700">
                    無料登録で、すべてのプログラムに提携申請できます
                  </p>
                  <Link href="/register?type=publisher">
                    <Button className="w-full mt-4">無料で登録する</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Programs Grid */}
            <div className="flex-1">
              <div className="grid gap-6 md:grid-cols-2">
                {programs.map((program) => (
                  <Card key={program.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="info">{program.category}</Badge>
                          <h3 className="mt-2 font-semibold text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-500">{program.advertiser}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {program.description}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">報酬</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(program.commissionAmount)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">EPC</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(program.epc)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">CVR</p>
                          <p className="font-semibold text-gray-900">{program.cvr}%</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Cookie有効期間: {program.cookieDays}日
                        </span>
                        <Link href={`/programs/${program.id}`}>
                          <Button size="sm">
                            詳細を見る
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    前へ
                  </Button>
                  <Button size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="px-2 text-gray-500">...</span>
                  <Button variant="outline" size="sm">10</Button>
                  <Button variant="outline" size="sm">
                    次へ
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
