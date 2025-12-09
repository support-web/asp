import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateProgramCode } from '@/lib/utils'

// GET - List programs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {
      status: 'active',
      visibility: 'public',
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { programName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        include: {
          advertiser: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.program.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        programs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Programs list error:', error)
    return NextResponse.json(
      { success: false, message: 'プログラムの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST - Create program (Advertiser only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'advertiser') {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const programCode = generateProgramCode()

    const program = await prisma.program.create({
      data: {
        advertiserId: session.user.advertiserId!,
        programName: body.programName,
        programCode,
        description: body.description,
        promotionText: body.promotionText,
        categoryId: body.categoryId,
        landingPageUrl: body.landingPageUrl,
        commissionType: body.commissionType,
        commissionAmount: body.commissionAmount,
        commissionRate: body.commissionRate,
        cookieDurationDays: body.cookieDurationDays || 30,
        conversionConditions: body.conversionConditions,
        deniedConditions: body.deniedConditions,
        status: 'draft',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          programId: program.id,
          programCode: program.programCode,
          status: program.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Program creation error:', error)
    return NextResponse.json(
      { success: false, message: 'プログラムの作成に失敗しました' },
      { status: 500 }
    )
  }
}
