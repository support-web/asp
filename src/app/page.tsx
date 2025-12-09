import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  Wallet
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: '高い成果報酬',
      description: '業界最高水準の成果報酬率で、あなたの収益を最大化します。',
    },
    {
      icon: Shield,
      title: '信頼性の高いトラッキング',
      description: 'Cookie + サーバー間通信のハイブリッド方式で正確な成果計測を実現。',
    },
    {
      icon: Zap,
      title: 'リアルタイムレポート',
      description: 'クリック・コンバージョンをリアルタイムで確認。即座に効果を把握できます。',
    },
    {
      icon: Users,
      title: '専任サポート',
      description: '経験豊富なスタッフがあなたのアフィリエイト活動をサポートします。',
    },
    {
      icon: BarChart3,
      title: '詳細な分析ツール',
      description: '多彩なレポート機能で、パフォーマンスを細かく分析できます。',
    },
    {
      icon: Wallet,
      title: '確実な支払い',
      description: '毎月確実にお支払い。最低支払額5,000円から振込可能です。',
    },
  ]

  const stats = [
    { value: '10,000+', label: '登録アフィリエイター' },
    { value: '500+', label: '広告プログラム' },
    { value: '10億円+', label: '累計支払額' },
    { value: '99.9%', label: 'システム稼働率' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                アフィリエイトで
                <br />
                <span className="text-primary-200">新しい収益</span>を創出
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto">
                広告主とアフィリエイターを繋ぐ、信頼のアフィリエイトプラットフォーム。
                <br className="hidden sm:block" />
                高い成果報酬と充実したサポートで、あなたのビジネスを成功に導きます。
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register?type=publisher"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-xl"
                >
                  アフィリエイターとして登録
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/register?type=advertiser"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  広告主として登録
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                選ばれる理由
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                ASP Platformは、広告主とアフィリエイターの双方にとって
                最適な環境を提供します。
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - For Publishers */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                アフィリエイターの方へ
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                3ステップで簡単に始められます
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: '無料登録',
                  description: 'メールアドレスだけで簡単に登録。審査通過後すぐに始められます。',
                },
                {
                  step: '02',
                  title: 'プログラムを選択',
                  description: '豊富なプログラムの中から、あなたのサイトに合った広告を選択。',
                },
                {
                  step: '03',
                  title: '報酬を獲得',
                  description: '成果が発生したら報酬確定。毎月確実にお支払いします。',
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-bold text-primary-100">{item.step}</div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/register?type=publisher"
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
              >
                今すぐ無料登録
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works - For Advertisers */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  広告主の方へ
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  成果報酬型広告で、効率的なプロモーションを実現しましょう。
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    '成果が発生した時だけ費用が発生',
                    '幅広いメディアネットワークにリーチ',
                    '詳細なレポートで効果を可視化',
                    '専任担当者によるサポート',
                    '柔軟な報酬設定が可能',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    href="/register?type=advertiser"
                    className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    広告主として登録
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="mt-12 lg:mt-0">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-gray-900">月間パフォーマンス</h4>
                      <span className="text-sm text-gray-500">2024年1月</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">クリック数</span>
                        <span className="font-semibold text-gray-900">125,340</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">コンバージョン</span>
                        <span className="font-semibold text-gray-900">3,752</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">CVR</span>
                        <span className="font-semibold text-green-600">2.99%</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">売上</span>
                        <span className="font-bold text-xl text-gray-900">¥18,760,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              今すぐASP Platformを始めましょう
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              登録は無料。数分で完了します。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?type=publisher"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-200"
              >
                アフィリエイター登録
              </Link>
              <Link
                href="/register?type=advertiser"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                広告主登録
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
