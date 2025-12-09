import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            advertiser: true,
            publisher: true,
          },
        })

        if (!user) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        if (user.status === 'banned') {
          throw new Error('このアカウントは利用停止されています')
        }

        if (user.status === 'suspended') {
          throw new Error('このアカウントは一時停止されています')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          status: user.status,
          advertiserId: user.advertiser?.id,
          publisherId: user.publisher?.id,
          advertiserStatus: user.advertiser?.status,
          publisherStatus: user.publisher?.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userType = user.userType
        token.status = user.status
        token.advertiserId = user.advertiserId
        token.publisherId = user.publisherId
        token.advertiserStatus = user.advertiserStatus
        token.publisherStatus = user.publisherStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = token.userType as string
        session.user.status = token.status as string
        session.user.advertiserId = token.advertiserId as string | undefined
        session.user.publisherId = token.publisherId as string | undefined
        session.user.advertiserStatus = token.advertiserStatus as string | undefined
        session.user.publisherStatus = token.publisherStatus as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
