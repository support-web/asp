import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  userType: z.enum(['publisher', 'advertiser']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        userType: validatedData.userType,
        status: 'pending',
      },
    })

    // Create associated profile based on user type
    if (validatedData.userType === 'publisher') {
      await prisma.publisher.create({
        data: {
          userId: user.id,
          publisherType: 'individual',
          status: 'pending_review',
        },
      })
    } else if (validatedData.userType === 'advertiser') {
      await prisma.advertiser.create({
        data: {
          userId: user.id,
          companyName: '',
          representativeName: '',
          status: 'pending_review',
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          message: '登録が完了しました。確認メールをご確認ください。',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: '登録に失敗しました。再度お試しください。' },
      { status: 500 }
    )
  }
}
