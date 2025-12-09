'use client'

import { useState } from 'react'
import {
  Building2,
  Globe,
  Package,
  User,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'

type TabType = 'advertisers' | 'publishers' | 'programs' | 'sites'

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('advertisers')

  const tabs = [
    { id: 'advertisers' as TabType, label: '広告主', icon: Building2, count: 8 },
    { id: 'publishers' as TabType, label: 'パブリッシャー', icon: User, count: 23 },
    { id: 'programs' as TabType, label: 'プログラム', icon: Package, count: 5 },
    { id: 'sites' as TabType, label: 'サイト', icon: Globe, count: 18 },
  ]

  // Demo data
  const pendingAdvertisers = [
    { id: '1', companyName: '株式会社サンプル', representativeName: '山田太郎', email: 'sample@example.com', website: 'https://example.com', createdAt: '2024-01-15' },
    { id: '2', companyName: 'XYZホールディングス', representativeName: '鈴木一郎', email: 'xyz@example.com', website: 'https://xyz.com', createdAt: '2024-01-14' },
    { id: '3', companyName: 'ABCコーポレーション', representativeName: '田中花子', email: 'abc@example.com', website: 'https://abc.co.jp', createdAt: '2024-01-14' },
  ]

  const pendingPublishers = [
    { id: '1', name: '山田太郎', type: 'individual', email: 'yamada@example.com', createdAt: '2024-01-15' },
    { id: '2', name: 'メディア株式会社', type: 'corporate', email: 'media@example.com', createdAt: '2024-01-15' },
    { id: '3', name: '鈴木花子', type: 'individual', email: 'suzuki@example.com', createdAt: '2024-01-14' },
  ]

  const pendingPrograms = [
    { id: '1', name: '新商品プログラム', advertiser: '株式会社サンプル', commission: 1000, createdAt: '2024-01-15' },
    { id: '2', name: 'キャンペーンプログラム', advertiser: 'XYZホールディングス', commission: 2000, createdAt: '2024-01-14' },
  ]

  const pendingSites = [
    { id: '1', siteName: 'サンプルブログ', siteUrl: 'https://blog.example.com', publisherName: '山田太郎', type: 'blog', createdAt: '2024-01-15' },
    { id: '2', siteName: 'SNSアカウント', siteUrl: 'https://twitter.com/sample', publisherName: '鈴木花子', type: 'sns', createdAt: '2024-01-15' },
    { id: '3', siteName: '比較サイト', siteUrl: 'https://compare.example.com', publisherName: 'メディア株式会社', type: 'website', createdAt: '2024-01-14' },
  ]

  const handleApprove = (type: TabType, id: string) => {
    console.log(`Approving ${type} ${id}`)
    // API call to approve
  }

  const handleReject = (type: TabType, id: string) => {
    console.log(`Rejecting ${type} ${id}`)
    // API call to reject
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">審査管理</h1>
        <p className="mt-1 text-gray-600">広告主・パブリッシャー・プログラム・サイトの審査を行います</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant="warning" className="ml-1">{tab.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'advertisers' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">会社名</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">代表者</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">メール</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Webサイト</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">登録日</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingAdvertisers.map((advertiser) => (
                    <tr key={advertiser.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{advertiser.companyName}</td>
                      <td className="py-4 px-4 text-gray-600">{advertiser.representativeName}</td>
                      <td className="py-4 px-4 text-gray-600">{advertiser.email}</td>
                      <td className="py-4 px-4">
                        <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center">
                          <span className="truncate max-w-[150px]">{advertiser.website}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{advertiser.createdAt}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject('advertisers', advertiser.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove('advertisers', advertiser.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            承認
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'publishers' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">名前</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">種別</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">メール</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">登録日</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingPublishers.map((publisher) => (
                    <tr key={publisher.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{publisher.name}</td>
                      <td className="py-4 px-4">
                        <Badge variant={publisher.type === 'corporate' ? 'info' : 'default'}>
                          {publisher.type === 'corporate' ? '法人' : '個人'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{publisher.email}</td>
                      <td className="py-4 px-4 text-gray-600">{publisher.createdAt}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject('publishers', publisher.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove('publishers', publisher.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            承認
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'programs' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">プログラム名</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">広告主</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">報酬</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">登録日</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{program.name}</td>
                      <td className="py-4 px-4 text-gray-600">{program.advertiser}</td>
                      <td className="py-4 px-4 text-right text-gray-900">¥{program.commission.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">{program.createdAt}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            承認
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sites' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">サイト名</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">URL</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">パブリッシャー</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">種別</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">登録日</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingSites.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{site.siteName}</td>
                      <td className="py-4 px-4">
                        <a href={site.siteUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center">
                          <span className="truncate max-w-[200px]">{site.siteUrl}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{site.publisherName}</td>
                      <td className="py-4 px-4">
                        <Badge>{site.type}</Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{site.createdAt}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            承認
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
