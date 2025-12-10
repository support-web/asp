import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      programCode,
      orderId,
      saleAmount,
      conversionType = 'sale',
      items,
      clickId: providedClickId,
    } = body

    // Find program
    const program = await prisma.program.findUnique({
      where: { programCode },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'プログラムが見つかりません' },
        { status: 404 }
      )
    }

    // Find click (from cookie or provided)
    let click = null
    if (providedClickId) {
      click = await prisma.click.findUnique({
        where: { clickId: providedClickId },
        include: { partnership: true },
      })
    }

    if (!click) {
      // Try to find recent click from the same session/user
      // In a real implementation, you'd use more sophisticated tracking
      return NextResponse.json(
        { success: false, message: 'クリック情報が見つかりません' },
        { status: 400 }
      )
    }

    // Calculate commission
    let commissionAmount: number
    if (program.commissionType === 'cpa' && program.commissionAmount) {
      commissionAmount = Number(program.commissionAmount)
    } else if (program.commissionRate && saleAmount) {
      commissionAmount = saleAmount * (Number(program.commissionRate) / 100)
    } else {
      commissionAmount = Number(program.commissionAmount) || 0
    }

    const conversionId = `cv_${uuidv4()}`

    // Create conversion
    const conversion = await prisma.conversion.create({
      data: {
        clickId: click.id,
        partnershipId: click.partnershipId,
        programId: program.id,
        conversionId,
        orderId,
        conversionType,
        saleAmount: saleAmount || 0,
        commissionAmount,
        items,
        status: 'pending',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    })

    // Update partnership stats
    await prisma.partnership.update({
      where: { id: click.partnershipId },
      data: {
        totalConversions: { increment: 1 },
        totalEarnings: { increment: commissionAmount },
      },
    })

    // Update program stats
    await prisma.program.update({
      where: { id: program.id },
      data: {
        totalConversions: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        conversionId: conversion.id,
        status: conversion.status,
      },
    })
  } catch (error) {
    console.error('Conversion tracking error:', error)
    return NextResponse.json(
      { success: false, message: 'コンバージョンの記録に失敗しました' },
      { status: 500 }
    )
  }
}
