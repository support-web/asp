'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  Eye
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { formatCurrency, formatNumber, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function AdvertiserProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Demo data
  const programs = [
    {
      id: '1',
      name: 'メイン商品プログラム',
      programCode: 'PRG001',
      status: 'active',
      commissionType: 'cpa',
      commissionAmount: 1000,
      cookieDays: 30,
      publishers: 85,
      clicks: 52340,
      conversions: 1560,
      cvr: 2.98,
      spent: 1560000,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: '新商品キャンペーン',
      programCode: 'PRG002',
      status: 'active',
      commissionType: 'cpa',
      commissionAmount: 2000,
      cookieDays: 45,
      publishers: 42,
      clicks: 28120,
      conversions: 845,
      cvr: 3.01,
      spent: 1690000,
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'セール特別プログラム',
      programCode: 'PRG003',
      status: 'paused',
      commissionType: 'hybrid',
      commissionAmount: 500,
      commissionRate: 5,
      cookieDays: 14,
      publishers: 35,
      clicks: 18500,
      conversions: 520,
      cvr: 2.81,
      spent: 780000,
      createdAt: '2024-01-05',
    },
    {
      id: '4',
      name: '定期購入プログラム',
      programCode: 'PRG004',
      status: 'active',
      commissionType: 'cpa',
      commissionAmount: 3000,
      cookieDays: 60,
      publishers: 28,
      clicks: 15200,
      conversions: 456,
      cvr: 3.0,
      spent: 1368000,
      createdAt: '2024-01-08',
    },
    {
      id: '5',
      name: 'テストプログラム',
      programCode: 'PRG005',
      status: 'draft',
      commissionType: 'cpa',
      commissionAmount: 1500,
      cookieDays: 30,
      publishers: 0,
      clicks: 0,
      conversions: 0,
      cvr: 0,
      spent: 0,
      createdAt: '2024-01-15',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プログラム管理</h1>
          <p className="mt-1 text-gray-600">
            広告プログラムの作成・管理を行います
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="プログラム名で検索..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
          <option value="">すべてのステータス</option>
          <option value="active">有効</option>
          <option value="paused">一時停止</option>
          <option value="draft">下書き</option>
        </select>
      </div>

      {/* Programs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">プログラム</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ステータス</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">報酬</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">提携数</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">クリック</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">成果</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">CVR</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">支出</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500">{program.programCode}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge className={getStatusColor(program.status)}>
                      {getStatusLabel(program.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-900">
                    {formatCurrency(program.commissionAmount)}
                    {program.commissionRate && <span className="text-xs text-gray-500"> + {program.commissionRate}%</span>}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatNumber(program.publishers)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatNumber(program.clicks)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatNumber(program.conversions)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {program.cvr.toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(program.spent)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <Link href={`/advertiser/programs/${program.id}`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/advertiser/programs/${program.id}/edit`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {program.status === 'active' ? (
                        <Button variant="ghost" size="sm" className="p-2">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : program.status === 'paused' ? (
                        <Button variant="ghost" size="sm" className="p-2">
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
