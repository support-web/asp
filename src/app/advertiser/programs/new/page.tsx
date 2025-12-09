'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select } from '@/components/ui'

export default function NewProgramPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    promotionText: '',
    categoryId: '',
    landingPageUrl: '',
    commissionType: 'cpa',
    commissionAmount: '',
    commissionRate: '',
    cookieDurationDays: '30',
    conversionConditions: '',
    deniedConditions: '',
    autoApprovePublishers: false,
  })

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending_review') => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          commissionAmount: formData.commissionAmount ? parseFloat(formData.commissionAmount) : null,
          commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
          cookieDurationDays: parseInt(formData.cookieDurationDays),
        }),
      })

      if (response.ok) {
        router.push('/advertiser/programs')
      }
    } catch (error) {
      console.error('Failed to create program:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { value: '', label: 'カテゴリを選択' },
    { value: 'ec', label: 'EC・通販' },
    { value: 'finance', label: '金融・投資' },
    { value: 'beauty', label: '美容・健康' },
    { value: 'education', label: '教育・スクール' },
    { value: 'travel', label: '旅行・レジャー' },
    { value: 'it', label: 'IT・通信' },
  ]

  const commissionTypes = [
    { value: 'cpa', label: '成果報酬型（CPA）' },
    { value: 'cpc', label: 'クリック報酬型（CPC）' },
    { value: 'hybrid', label: 'ハイブリッド（固定+率）' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/advertiser/programs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規プログラム作成</h1>
          <p className="text-gray-600">広告プログラムの詳細を入力してください</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'pending_review')}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="プログラム名"
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  placeholder="例: サンプル商品アフィリエイトプログラム"
                  required
                />

                <Textarea
                  label="プログラム説明"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="アフィリエイターに向けたプログラムの説明を入力"
                  rows={4}
                />

                <Textarea
                  label="PR文・訴求ポイント"
                  value={formData.promotionText}
                  onChange={(e) => setFormData({ ...formData, promotionText: e.target.value })}
                  placeholder="アフィリエイターが使用できるPR文を入力"
                  rows={3}
                />

                <Select
                  label="カテゴリ"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categories}
                />

                <Input
                  label="ランディングページURL"
                  type="url"
                  value={formData.landingPageUrl}
                  onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                  placeholder="https://example.com/lp"
                  required
                />
              </CardContent>
            </Card>

            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle>報酬設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="報酬タイプ"
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                  options={commissionTypes}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="固定報酬額（円）"
                    type="number"
                    value={formData.commissionAmount}
                    onChange={(e) => setFormData({ ...formData, commissionAmount: e.target.value })}
                    placeholder="1000"
                  />

                  {formData.commissionType === 'hybrid' && (
                    <Input
                      label="報酬率（%）"
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                      placeholder="5"
                    />
                  )}
                </div>

                <Input
                  label="Cookie有効期間（日）"
                  type="number"
                  value={formData.cookieDurationDays}
                  onChange={(e) => setFormData({ ...formData, cookieDurationDays: e.target.value })}
                  placeholder="30"
                />
              </CardContent>
            </Card>

            {/* Conversion Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>成果条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="成果承認条件"
                  value={formData.conversionConditions}
                  onChange={(e) => setFormData({ ...formData, conversionConditions: e.target.value })}
                  placeholder="例: 商品購入完了、30日以内にキャンセルがない場合"
                  rows={3}
                />

                <Textarea
                  label="成果否認条件"
                  value={formData.deniedConditions}
                  onChange={(e) => setFormData({ ...formData, deniedConditions: e.target.value })}
                  placeholder="例: 返品・キャンセル、重複注文、不正な申込み"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle>公開設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={formData.autoApprovePublishers}
                    onChange={(e) => setFormData({ ...formData, autoApprovePublishers: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoApprove" className="ml-2 text-sm text-gray-700">
                    提携申請を自動承認する
                  </label>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    審査に提出
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => handleSubmit(e as any, 'draft')}
                  >
                    下書き保存
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>作成のヒント</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    魅力的なプログラム名をつけましょう
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    成果条件は明確に記載しましょう
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    適切な報酬額を設定しましょう
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    PR文はアフィリエイターが使いやすい内容に
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
