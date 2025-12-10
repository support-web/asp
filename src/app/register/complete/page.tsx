'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui'

function CompleteContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') || 'publisher'

  return (
    <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start">
        <Mail className="h-6 w-6 text-blue-500 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-900">
            確認メールをご確認ください
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-900">次のステップ</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>確認メール内のリンクをクリック</li>
          <li>ログインして{userType === 'publisher' ? 'プロフィール' : '会社情報'}を登録</li>
          <li>
            {userType === 'publisher'
              ? 'サイト情報を登録して審査を受ける'
              : '広告プログラムを作成して公開'}
          </li>
          <li>
            {userType === 'publisher'
              ? '提携プログラムを見つけて収益を得る'
              : 'アフィリエイターからの提携申請を管理'}
          </li>
        </ol>
      </div>

      <div className="mt-8 space-y-3">
        <Link href="/login">
          <Button size="lg" className="w-full">
            ログインページへ
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full">
            トップページに戻る
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function RegisterCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            登録が完了しました
          </h2>
          <p className="mt-4 text-gray-600">
            ご登録いただいたメールアドレスに確認メールを送信しました。
            <br />
            メール内のリンクをクリックして、アカウントを有効化してください。
          </p>
        </div>

        <Suspense fallback={<div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10 animate-pulse h-64" />}>
          <CompleteContent />
        </Suspense>
      </div>
    </div>
  )
}
