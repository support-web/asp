import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateAffiliateCode } from '@/lib/utils'

// GET - List partnerships
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    let where: any = {}

    if (session.user.userType === 'publisher') {
      where.publisherId = session.user.publisherId
    } else if (session.user.userType === 'advertiser') {
      where.program = {
        advertiserId: session.user.advertiserId,
      }
    }

    if (status) {
      where.status = status
    }

    const [partnerships, total] = await Promise.all([
      prisma.partnership.findMany({
        where,
        include: {
          program: {
            include: {
              advertiser: {
                select: {
                  companyName: true,
                  logoUrl: true,
                },
              },
            },
          },
          publisher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          site: {
            select: {
              id: true,
              siteName: true,
              siteUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partnership.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        partnerships,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Partnerships list error:', error)
    return NextResponse.json(
      { success: false, message: '提携情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST - Apply for partnership (Publisher only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'publisher') {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { programId, siteId, message } = body

    // Check if already partnered
    const existing = await prisma.partnership.findFirst({
      where: {
        programId,
        publisherId: session.user.publisherId!,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: '既にこのプログラムに提携申請済みです' },
        { status: 400 }
      )
    }

    // Get program to check auto-approve
    const program = await prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'プログラムが見つかりません' },
        { status: 404 }
      )
    }

    const affiliateCode = generateAffiliateCode()
    const trackingUrl = `${process.env.NEXT_PUBLIC_TRACKING_DOMAIN}/track/click/${affiliateCode}`

    const partnership = await prisma.partnership.create({
      data: {
        programId,
        publisherId: session.user.publisherId!,
        siteId,
        affiliateCode,
        trackingUrl,
        status: program.autoApprovePublishers ? 'approved' : 'pending',
        reviewedAt: program.autoApprovePublishers ? new Date() : null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          partnershipId: partnership.id,
          affiliateCode: partnership.affiliateCode,
          trackingUrl: partnership.trackingUrl,
          status: partnership.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Partnership application error:', error)
    return NextResponse.json(
      { success: false, message: '提携申請に失敗しました' },
      { status: 500 }
    )
  }
}
