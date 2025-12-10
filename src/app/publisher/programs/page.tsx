'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button, Card, CardContent, Badge, Input } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export default function PublisherProgramsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  // Demo data
  const categories = [
    { id: '1', name: 'EC・通販', count: 150 },
    { id: '2', name: '金融・投資', count: 85 },
    { id: '3', name: '美容・健康', count: 120 },
    { id: '4', name: '教育・スクール', count: 65 },
    { id: '5', name: '旅行・レジャー', count: 45 },
    { id: '6', name: 'IT・通信', count: 90 },
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
      commissionRate: null,
      cookieDays: 30,
      epc: 45,
      cvr: 3.2,
      status: 'active',
    },
    {
      id: '2',
      name: 'オンライン英会話スクール',
      advertiser: 'ABC英会話株式会社',
      description: 'マンツーマンのオンライン英会話。無料体験から有料会員への転換率が高いです。',
      category: '教育・スクール',
      commissionType: 'cpa',
      commissionAmount: 5000,
      commissionRate: null,
      cookieDays: 60,
      epc: 120,
      cvr: 2.4,
      status: 'active',
    },
    {
      id: '3',
      name: '美容サプリメント定期購入',
      advertiser: 'ビューティーラボ株式会社',
      description: '人気の美容サプリメント。定期購入で高額報酬が得られます。',
      category: '美容・健康',
      commissionType: 'cpa',
      commissionAmount: 3000,
      commissionRate: null,
      cookieDays: 45,
      epc: 85,
      cvr: 2.8,
      status: 'active',
    },
    {
      id: '4',
      name: '格安SIM比較サイト',
      advertiser: 'モバイル比較株式会社',
      description: '各社格安SIMの比較・申込サイト。MNP申込で報酬発生。',
      category: 'IT・通信',
      commissionType: 'cpa',
      commissionAmount: 2500,
      commissionRate: null,
      cookieDays: 30,
      epc: 65,
      cvr: 2.6,
      status: 'active',
    },
    {
      id: '5',
      name: '投資信託口座開設',
      advertiser: '〇〇証券株式会社',
      description: 'ネット証券の口座開設プログラム。初回入金で報酬発生。',
      category: '金融・投資',
      commissionType: 'cpa',
      commissionAmount: 8000,
      commissionRate: null,
      cookieDays: 90,
      epc: 180,
      cvr: 2.2,
      status: 'active',
    },
    {
      id: '6',
      name: '旅行予約サイト',
      advertiser: 'トラベル株式会社',
      description: '国内・海外旅行の予約サイト。予約金額に応じた報酬。',
      category: '旅行・レジャー',
      commissionType: 'hybrid',
      commissionAmount: null,
      commissionRate: 3,
      cookieDays: 30,
      epc: 55,
      cvr: 1.8,
      status: 'active',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">プログラム検索</h1>
        <p className="mt-1 text-gray-600">
          あなたのサイトに合った広告プログラムを見つけましょう
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="プログラム名、広告主名で検索..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid3X3 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Categories */}
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
        </div>

        {/* Programs Grid */}
        <div className="flex-1">
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2' : 'space-y-4'}>
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
                        {program.commissionAmount
                          ? formatCurrency(program.commissionAmount)
                          : `${program.commissionRate}%`}
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
                    <Link href={`/publisher/programs/${program.id}`}>
                      <Button size="sm">
                        詳細・提携申請
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
  )
}
