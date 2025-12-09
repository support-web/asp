import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateClickId } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    const { searchParams } = new URL(request.url)
    const creativeId = searchParams.get('cid')
    const subId1 = searchParams.get('sub1')
    const subId2 = searchParams.get('sub2')
    const subId3 = searchParams.get('sub3')

    // Find partnership
    const partnership = await prisma.partnership.findUnique({
      where: { affiliateCode: code },
      include: {
        program: true,
      },
    })

    if (!partnership || partnership.status !== 'approved') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      '0.0.0.0'

    // Detect device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'other' = 'other'
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad|Tablet/.test(userAgent)) {
        deviceType = 'tablet'
      } else {
        deviceType = 'mobile'
      }
    } else if (/Windows|Macintosh|Linux/.test(userAgent)) {
      deviceType = 'desktop'
    }

    const clickId = generateClickId()

    // Record click
    await prisma.click.create({
      data: {
        partnershipId: partnership.id,
        creativeId,
        clickId,
        subId1,
        subId2,
        subId3,
        ipAddress,
        userAgent,
        refererUrl: referer,
        landingUrl: partnership.program.landingPageUrl,
        deviceType,
      },
    })

    // Update partnership stats
    await prisma.partnership.update({
      where: { id: partnership.id },
      data: {
        totalClicks: { increment: 1 },
      },
    })

    // Update program stats
    await prisma.program.update({
      where: { id: partnership.programId },
      data: {
        totalClicks: { increment: 1 },
      },
    })

    // Set cookie and redirect
    const response = NextResponse.redirect(partnership.program.landingPageUrl)

    // Set tracking cookie
    const cookieMaxAge = partnership.program.cookieDurationDays * 24 * 60 * 60
    response.cookies.set('aff_click', clickId, {
      maxAge: cookieMaxAge,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Click tracking error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
