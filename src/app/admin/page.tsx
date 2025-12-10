'use client'

import Link from 'next/link'
import {
  Users,
  Building2,
  Globe,
  Package,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import { StatsCard, RecentActivity } from '@/components/dashboard'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatCurrency, formatNumber, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function AdminDashboard() {
  // Demo data
  const stats = {
    totalAdvertisers: 523,
    advertisersChange: 8,
    totalPublishers: 12450,
    publishersChange: 12,
    activePrograms: 892,
    programsChange: 5,
    monthlyRevenue: 45000000,
    revenueChange: 15,
  }

  const pendingReviews = {
    advertisers: 8,
    publishers: 23,
    programs: 5,
    sites: 18,
  }

  const recentActivities = [
    {
      id: '1',
      type: 'conversion',
      message: '本日の成果件数が10,000件を突破しました',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'partnership',
      message: '新規広告主「株式会社ABC」が登録しました',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '3',
      type: 'payment',
      message: '1月分の支払い処理が完了しました（¥32,500,000）',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  const recentAdvertisers = [
    { id: '1', name: '株式会社サンプル', status: 'pending_review', createdAt: '2024-01-15' },
    { id: '2', name: 'ABC商事株式会社', status: 'approved', createdAt: '2024-01-14' },
    { id: '3', name: 'XYZホールディングス', status: 'pending_review', createdAt: '2024-01-14' },
  ]

  const recentPublishers = [
    { id: '1', name: '山田太郎', type: 'individual', status: 'pending_review', createdAt: '2024-01-15' },
    { id: '2', name: 'メディア株式会社', type: 'corporate', status: 'approved', createdAt: '2024-01-15' },
    { id: '3', name: '鈴木花子', type: 'individual', status: 'pending_review', createdAt: '2024-01-14' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="mt-1 text-gray-600">システム全体の状況を確認</p>
      </div>

      {/* Pending Reviews Alert */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">審査待ちの項目があります</p>
                <p className="text-sm text-yellow-700">
                  広告主: {pendingReviews.advertisers}件 / パブリッシャー: {pendingReviews.publishers}件 /
                  プログラム: {pendingReviews.programs}件 / サイト: {pendingReviews.sites}件
                </p>
              </div>
            </div>
            <Link href="/admin/reviews">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                審査画面へ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="広告主数"
          value={formatNumber(stats.totalAdvertisers)}
          change={{ value: stats.advertisersChange, label: '今月' }}
          icon={Building2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="パブリッシャー数"
          value={formatNumber(stats.totalPublishers)}
          change={{ value: stats.publishersChange, label: '今月' }}
          icon={Globe}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="アクティブプログラム"
          value={formatNumber(stats.activePrograms)}
          change={{ value: stats.programsChange, label: '今月' }}
          icon={Package}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="今月の売上"
          value={formatCurrency(stats.monthlyRevenue)}
          change={{ value: stats.revenueChange, label: '先月比' }}
          icon={TrendingUp}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div>
          <RecentActivity activities={recentActivities} />
        </div>

        {/* Recent Advertisers */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新規広告主</CardTitle>
              <Link href="/admin/advertisers">
                <Button variant="ghost" size="sm">すべて見る</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAdvertisers.map((advertiser) => (
                  <div key={advertiser.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{advertiser.name}</p>
                      <p className="text-xs text-gray-500">{advertiser.createdAt}</p>
                    </div>
                    <Badge className={getStatusColor(advertiser.status)}>
                      {getStatusLabel(advertiser.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Publishers */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新規パブリッシャー</CardTitle>
              <Link href="/admin/publishers">
                <Button variant="ghost" size="sm">すべて見る</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPublishers.map((publisher) => (
                  <div key={publisher.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{publisher.name}</p>
                      <p className="text-xs text-gray-500">
                        {publisher.type === 'individual' ? '個人' : '法人'} - {publisher.createdAt}
                      </p>
                    </div>
                    <Badge className={getStatusColor(publisher.status)}>
                      {getStatusLabel(publisher.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/reviews">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-600" />
              <h3 className="mt-3 font-semibold text-gray-900">審査管理</h3>
              <p className="mt-1 text-sm text-gray-600">
                {pendingReviews.advertisers + pendingReviews.publishers + pendingReviews.programs + pendingReviews.sites}件の審査待ち
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payouts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Wallet className="h-8 w-8 mx-auto text-green-600" />
              <h3 className="mt-3 font-semibold text-gray-900">支払い管理</h3>
              <p className="mt-1 text-sm text-gray-600">
                支払い処理・履歴確認
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600" />
              <h3 className="mt-3 font-semibold text-gray-900">ユーザー管理</h3>
              <p className="mt-1 text-sm text-gray-600">
                ユーザー一覧・権限管理
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-600" />
              <h3 className="mt-3 font-semibold text-gray-900">レポート</h3>
              <p className="mt-1 text-sm text-gray-600">
                分析・統計レポート
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
