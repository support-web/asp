'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Link2,
  BarChart3,
  Wallet,
  Settings,
  Users,
  Package,
  Shield,
  Bell,
  Building2,
  Globe,
  CreditCard,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  LucideIcon
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarProps {
  userType: 'admin' | 'advertiser' | 'publisher'
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()

  const getNavItems = (): NavItem[] => {
    switch (userType) {
      case 'admin':
        return [
          { label: 'ダッシュボード', href: '/admin', icon: LayoutDashboard },
          { label: 'ユーザー管理', href: '/admin/users', icon: Users },
          { label: '広告主管理', href: '/admin/advertisers', icon: Building2 },
          { label: 'パブリッシャー管理', href: '/admin/publishers', icon: Globe },
          { label: 'プログラム管理', href: '/admin/programs', icon: Package },
          { label: '審査待ち', href: '/admin/reviews', icon: Shield, badge: 5 },
          { label: '支払い管理', href: '/admin/payouts', icon: CreditCard },
          { label: 'レポート', href: '/admin/reports', icon: BarChart3 },
          { label: '設定', href: '/admin/settings', icon: Settings },
        ]
      case 'advertiser':
        return [
          { label: 'ダッシュボード', href: '/advertiser', icon: LayoutDashboard },
          { label: 'プログラム管理', href: '/advertiser/programs', icon: Package },
          { label: '提携管理', href: '/advertiser/partnerships', icon: Link2 },
          { label: 'レポート', href: '/advertiser/reports', icon: BarChart3 },
          { label: 'コンバージョン', href: '/advertiser/conversions', icon: TrendingUp },
          { label: '請求・支払い', href: '/advertiser/billing', icon: Wallet },
          { label: '通知', href: '/advertiser/notifications', icon: Bell },
          { label: '設定', href: '/advertiser/settings', icon: Settings },
        ]
      case 'publisher':
        return [
          { label: 'ダッシュボード', href: '/publisher', icon: LayoutDashboard },
          { label: 'プログラム検索', href: '/publisher/programs', icon: FileText },
          { label: '提携中プログラム', href: '/publisher/partnerships', icon: Link2 },
          { label: 'サイト管理', href: '/publisher/sites', icon: Globe },
          { label: 'レポート', href: '/publisher/reports', icon: BarChart3 },
          { label: '報酬・支払い', href: '/publisher/earnings', icon: Wallet },
          { label: '通知', href: '/publisher/notifications', icon: Bell },
          { label: '設定', href: '/publisher/settings', icon: Settings },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()
  const basePath = `/${userType}`

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-lg font-bold text-gray-900">ASP Platform</span>
        </Link>
      </div>

      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    )} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">ヘルプ</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            ご不明な点がございましたらお問い合わせください
          </p>
          <Link
            href="/contact"
            className="mt-2 block text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            サポートに連絡
          </Link>
        </div>
      </div>
    </aside>
  )
}
