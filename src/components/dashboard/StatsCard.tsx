'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100'
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              'mt-2 text-sm',
              change.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  )
}
