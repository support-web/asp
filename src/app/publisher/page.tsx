'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp,
  MousePointerClick,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ExternalLink
} from 'lucide-react'
import { StatsCard, RecentActivity, ChartCard } from '@/components/dashboard'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function PublisherDashboard() {
  const { data: session } = useSession()

  // Demo data - in real app, fetch from API
  const stats = {
    totalClicks: 15420,
    clicksChange: 12.5,
    totalConversions: 462,
    conversionsChange: 8.3,
    pendingEarnings: 231000,
    confirmedEarnings: 485000,
    earningsChange: 15.2,
  }

  const recentActivities = [
    {
      id: '1',
      type: 'conversion',
      message: 'サンプル商品Aで成果が発生しました (+¥1,000)',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'partnership',
      message: 'ECサイトBプログラムとの提携が承認されました',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'click',
      message: '今日のクリック数が100を超えました',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4',
      type: 'payment',
      message: '1月分の報酬が振り込まれました',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  const topPrograms = [
    { name: 'サンプルECサイト', clicks: 5230, conversions: 156, earnings: 156000 },
    { name: 'オンラインスクール', clicks: 3120, conversions: 89, earnings: 89000 },
    { name: '美容サプリメント', clicks: 2840, conversions: 72, earnings: 72000 },
    { name: '格安SIM比較', clicks: 1890, conversions: 45, earnings: 45000 },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            こんにちは、{session?.user?.email?.split('@')[0]}さん
          </h1>
          <p className="mt-1 text-gray-600">
            今月のパフォーマンスを確認しましょう
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/publisher/programs">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              プログラムを探す
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="クリック数"
          value={formatNumber(stats.totalClicks)}
          change={{ value: stats.clicksChange, label: '先月比' }}
          icon={MousePointerClick}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="成果件数"
          value={formatNumber(stats.totalConversions)}
          change={{ value: stats.conversionsChange, label: '先月比' }}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="未確定報酬"
          value={formatCurrency(stats.pendingEarnings)}
          icon={Wallet}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <StatsCard
          title="確定報酬"
          value={formatCurrency(stats.confirmedEarnings)}
          change={{ value: stats.earningsChange, label: '先月比' }}
          icon={Wallet}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="パフォーマンス推移"
            subtitle="過去30日間"
            action={
              <select className="text-sm border-gray-300 rounded-lg">
                <option>過去30日間</option>
                <option>過去7日間</option>
                <option>今月</option>
              </select>
            }
          >
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">グラフはデータ接続後に表示されます</p>
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Top Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>成果の多いプログラム</CardTitle>
          <Link href="/publisher/partnerships">
            <Button variant="ghost" size="sm">
              すべて見る
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">プログラム</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">クリック</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">成果</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">報酬</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topPrograms.map((program, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{program.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatNumber(program.clicks)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {formatNumber(program.conversions)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(program.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900">新しいプログラムを探す</h3>
            <p className="mt-2 text-sm text-gray-600">
              あなたのサイトに合った広告プログラムを見つけましょう
            </p>
            <Link href="/publisher/programs">
              <Button variant="outline" size="sm" className="mt-4">
                プログラム検索
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900">サイトを追加</h3>
            <p className="mt-2 text-sm text-gray-600">
              新しいサイトやSNSアカウントを登録して収益を拡大
            </p>
            <Link href="/publisher/sites">
              <Button variant="outline" size="sm" className="mt-4">
                サイト管理
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900">レポートを確認</h3>
            <p className="mt-2 text-sm text-gray-600">
              詳細なレポートでパフォーマンスを分析
            </p>
            <Link href="/publisher/reports">
              <Button variant="outline" size="sm" className="mt-4">
                レポート
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
