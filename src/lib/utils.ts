import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'AFF'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateProgramCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PRG'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateClickId(): string {
  return `clk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-red-100 text-red-800',
    banned: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    terminated: 'bg-gray-100 text-gray-800',
    paused: 'bg-gray-100 text-gray-800',
    draft: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    paid: 'bg-purple-100 text-purple-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '審査待ち',
    pending_review: '審査待ち',
    active: '有効',
    approved: '承認済み',
    completed: '完了',
    confirmed: '確定',
    rejected: '却下',
    suspended: '停止中',
    banned: '利用禁止',
    canceled: 'キャンセル',
    terminated: '終了',
    paused: '一時停止',
    draft: '下書き',
    processing: '処理中',
    failed: '失敗',
    paid: '支払済み',
  }
  return labels[status] || status
}

export function getRankLabel(rank: string): string {
  const labels: Record<string, string> = {
    regular: 'レギュラー',
    bronze: 'ブロンズ',
    silver: 'シルバー',
    gold: 'ゴールド',
    platinum: 'プラチナ',
  }
  return labels[rank] || rank
}

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    regular: 'bg-gray-100 text-gray-800',
    bronze: 'bg-orange-100 text-orange-800',
    silver: 'bg-slate-100 text-slate-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800',
  }
  return colors[rank] || 'bg-gray-100 text-gray-800'
}
