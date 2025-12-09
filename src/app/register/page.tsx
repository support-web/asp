'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  User
} from 'lucide-react'

type UserType = 'publisher' | 'advertiser'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userType, setUserType] = useState<UserType>('publisher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'advertiser' || type === 'publisher') {
      setUserType(type)
    }
  }, [searchParams])

  const passwordRequirements = [
    { label: '8文字以上', met: password.length >= 8 },
    { label: '英字を含む', met: /[a-zA-Z]/.test(password) },
    { label: '数字を含む', met: /[0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError('パスワードの要件を満たしてください')
      return
    }

    if (!termsAccepted) {
      setError('利用規約に同意してください')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '登録に失敗しました')
      }

      router.push(`/register/complete?type=${userType}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10">
      {/* User Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          アカウントの種類
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setUserType('publisher')}
            className={`p-4 rounded-xl border-2 transition-all ${
              userType === 'publisher'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className={`h-6 w-6 mx-auto ${
              userType === 'publisher' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className={`mt-2 text-sm font-medium ${
              userType === 'publisher' ? 'text-primary-700' : 'text-gray-700'
            }`}>
              アフィリエイター
            </p>
            <p className="mt-1 text-xs text-gray-500">
              広告を掲載して報酬を得る
            </p>
          </button>
          <button
            type="button"
            onClick={() => setUserType('advertiser')}
            className={`p-4 rounded-xl border-2 transition-all ${
              userType === 'advertiser'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building2 className={`h-6 w-6 mx-auto ${
              userType === 'advertiser' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className={`mt-2 text-sm font-medium ${
              userType === 'advertiser' ? 'text-primary-700' : 'text-gray-700'
            }`}>
              広告主
            </p>
            <p className="mt-1 text-xs text-gray-500">
              広告を出稿してプロモーション
            </p>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            メールアドレス
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="mail@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            パスワード
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="8文字以上の英数字"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {passwordRequirements.map((req, index) => (
              <span
                key={index}
                className={`inline-flex items-center text-xs ${
                  req.met ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {req.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            パスワード（確認）
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="パスワードを再入力"
              required
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-sm text-red-600">パスワードが一致しません</p>
          )}
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              プライバシーポリシー
            </Link>
            に同意します
          </label>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {userType === 'publisher' ? 'アフィリエイターとして登録' : '広告主として登録'}
        </Button>
      </form>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ASP Platform</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            新規アカウント登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/login" className="ml-1 text-primary-600 hover:text-primary-700 font-medium">
              ログイン
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<div className="bg-white py-8 px-6 shadow-lg rounded-2xl sm:px-10 animate-pulse h-96" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
