'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp,
  MousePointerClick,
  Users,
  Package,
  ArrowUpRight,
  Plus,
  ExternalLink
} from 'lucide-react'
import { StatsCard, RecentActivity, ChartCard } from '@/components/dashboard'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatNumber, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function AdvertiserDashboard() {
  const { data: session } = useSession()

  // Demo data
  const stats = {
    totalClicks: 125340,
    clicksChange: 8.5,
    totalConversions: 3752,
    conversionsChange: 12.3,
    activePublishers: 245,
    publishersChange: 5.2,
    totalSpent: 3752000,
    spentChange: 10.8,
  }

  const recentActivities = [
    {
      id: '1',
      type: 'conversion',
      message: 'サンプル商品Aプログラムで52件の成果が発生',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'partnership',
      message: '新しいアフィリエイターから提携申請が3件届いています',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'click',
      message: '今日のクリック数が5,000を超えました',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  const programs = [
    { id: '1', name: 'メイン商品プログラム', status: 'active', publishers: 85, clicks: 52340, conversions: 1560, spent: 1560000 },
    { id: '2', name: '新商品キャンペーン', status: 'active', publishers: 42, clicks: 28120, conversions: 845, spent: 845000 },
    { id: '3', name: 'セール特別プログラム', status: 'paused', publishers: 35, clicks: 18500, conversions: 520, spent: 520000 },
    { id: '4', name: '定期購入プログラム', status: 'active', publishers: 28, clicks: 15200, conversions: 456, spent: 456000 },
  ]

  const pendingPartnerships = [
    { id: '1', publisherName: '山田太郎', siteName: 'ブログA', programName: 'メイン商品プログラム', appliedAt: '2024-01-15' },
    { id: '2', publisherName: '鈴木花子', siteName: 'SNSアカウント', programName: '新商品キャンペーン', appliedAt: '2024-01-15' },
    { id: '3', publisherName: '田中一郎', siteName: '比較サイトB', programName: 'メイン商品プログラム', appliedAt: '2024-01-14' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-gray-600">
            広告プログラムのパフォーマンスを確認
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/advertiser/programs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規プログラム作成
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="総クリック数"
          value={formatNumber(stats.totalClicks)}
          change={{ value: stats.clicksChange, label: '先月比' }}
          icon={MousePointerClick}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="総成果数"
          value={formatNumber(stats.totalConversions)}
          change={{ value: stats.conversionsChange, label: '先月比' }}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="提携パブリッシャー"
          value={formatNumber(stats.activePublishers)}
          change={{ value: stats.publishersChange, label: '先月比' }}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="今月の広告費"
          value={formatCurrency(stats.totalSpent)}
          change={{ value: stats.spentChange, label: '先月比' }}
          icon={Package}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Programs & Pending Partnerships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Programs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>プログラム一覧</CardTitle>
            <Link href="/advertiser/programs">
              <Button variant="ghost" size="sm">
                すべて見る
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">{program.name}</span>
                      <Badge className={getStatusColor(program.status)}>
                        {getStatusLabel(program.status)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{program.publishers}人</span>
                      <span>{formatNumber(program.clicks)}クリック</span>
                      <span>{formatNumber(program.conversions)}成果</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(program.spent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Partnerships */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle>提携申請</CardTitle>
              <Badge variant="warning">{pendingPartnerships.length}件</Badge>
            </div>
            <Link href="/advertiser/partnerships">
              <Button variant="ghost" size="sm">
                すべて見る
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPartnerships.map((partnership) => (
                <div key={partnership.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{partnership.publisherName}</p>
                    <p className="text-sm text-gray-500">{partnership.siteName}</p>
                    <p className="text-xs text-gray-400 mt-1">{partnership.programName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">却下</Button>
                    <Button size="sm">承認</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
