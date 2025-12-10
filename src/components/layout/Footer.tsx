'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-white">ASP Platform</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              広告主とアフィリエイターを繋ぐ、信頼のアフィリエイトプラットフォーム
            </p>
          </div>

          {/* For Affiliates */}
          <div>
            <h3 className="text-white font-semibold mb-4">アフィリエイター向け</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?type=publisher" className="hover:text-white transition-colors">
                  新規登録
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  プログラム検索
                </Link>
              </li>
              <li>
                <Link href="/guide/publisher" className="hover:text-white transition-colors">
                  使い方ガイド
                </Link>
              </li>
              <li>
                <Link href="/faq/publisher" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* For Advertisers */}
          <div>
            <h3 className="text-white font-semibold mb-4">広告主向け</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?type=advertiser" className="hover:text-white transition-colors">
                  新規登録
                </Link>
              </li>
              <li>
                <Link href="/advertiser/guide" className="hover:text-white transition-colors">
                  広告出稿ガイド
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/faq/advertiser" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">会社情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  サービス紹介
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} ASP Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
