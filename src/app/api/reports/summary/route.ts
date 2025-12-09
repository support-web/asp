import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    let where: any = {}

    if (session.user.userType === 'publisher') {
      where.partnership = {
        publisherId: session.user.publisherId,
      }
    } else if (session.user.userType === 'advertiser') {
      where.program = {
        advertiserId: session.user.advertiserId,
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      where.convertedAt = dateFilter
    }

    // Get conversions
    const conversions = await prisma.conversion.findMany({
      where,
      include: {
        program: true,
        partnership: true,
      },
    })

    // Calculate summary
    const totalConversions = conversions.length
    const totalCommission = conversions.reduce(
      (sum, c) => sum + Number(c.commissionAmount),
      0
    )
    const pendingCommission = conversions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0)
    const approvedCommission = conversions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0)

    // Get clicks count
    let clickWhere: any = {}
    if (session.user.userType === 'publisher') {
      clickWhere.partnership = {
        publisherId: session.user.publisherId,
      }
    } else if (session.user.userType === 'advertiser') {
      clickWhere.partnership = {
        program: {
          advertiserId: session.user.advertiserId,
        },
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      clickWhere.clickedAt = dateFilter
    }

    const totalClicks = await prisma.click.count({ where: clickWhere })

    const conversionRate = totalClicks > 0
      ? ((totalConversions / totalClicks) * 100).toFixed(2)
      : '0.00'

    const epc = totalClicks > 0
      ? (totalCommission / totalClicks).toFixed(2)
      : '0.00'

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalClicks,
          totalConversions,
          totalCommission,
          pendingCommission,
          approvedCommission,
          conversionRate: parseFloat(conversionRate),
          epc: parseFloat(epc),
        },
      },
    })
  } catch (error) {
    console.error('Reports summary error:', error)
    return NextResponse.json(
      { success: false, message: 'レポートの取得に失敗しました' },
      { status: 500 }
    )
  }
}
