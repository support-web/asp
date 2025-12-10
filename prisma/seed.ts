import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ec' },
      update: {},
      create: { name: 'EC・通販', slug: 'ec', icon: 'shopping-cart', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'finance' },
      update: {},
      create: { name: '金融・投資', slug: 'finance', icon: 'credit-card', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: { name: '美容・健康', slug: 'beauty', icon: 'heart', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: { name: '教育・スクール', slug: 'education', icon: 'book', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: { name: '旅行・レジャー', slug: 'travel', icon: 'plane', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'it' },
      update: {},
      create: { name: 'IT・通信', slug: 'it', icon: 'smartphone', sortOrder: 6 },
    }),
  ])

  console.log(`Created ${categories.length} categories`)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      userType: 'admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  })
  console.log('Created admin user: admin@example.com / admin123')

  // Create demo advertiser
  const advertiserPassword = await bcrypt.hash('advertiser123', 12)
  const advertiserUser = await prisma.user.upsert({
    where: { email: 'advertiser@example.com' },
    update: {},
    create: {
      email: 'advertiser@example.com',
      passwordHash: advertiserPassword,
      userType: 'advertiser',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  })

  const advertiser = await prisma.advertiser.upsert({
    where: { userId: advertiserUser.id },
    update: {},
    create: {
      userId: advertiserUser.id,
      companyName: '株式会社サンプル',
      companyNameKana: 'カブシキガイシャサンプル',
      representativeName: '山田太郎',
      postalCode: '100-0001',
      address: '東京都千代田区丸の内1-1-1',
      phone: '03-1234-5678',
      websiteUrl: 'https://example.com',
      businessType: 'EC',
      status: 'approved',
      reviewedAt: new Date(),
    },
  })
  console.log('Created advertiser: advertiser@example.com / advertiser123')

  // Create demo publisher
  const publisherPassword = await bcrypt.hash('publisher123', 12)
  const publisherUser = await prisma.user.upsert({
    where: { email: 'publisher@example.com' },
    update: {},
    create: {
      email: 'publisher@example.com',
      passwordHash: publisherPassword,
      userType: 'publisher',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  })

  const publisher = await prisma.publisher.upsert({
    where: { userId: publisherUser.id },
    update: {},
    create: {
      userId: publisherUser.id,
      publisherType: 'individual',
      firstName: '太郎',
      lastName: '鈴木',
      firstNameKana: 'タロウ',
      lastNameKana: 'スズキ',
      postalCode: '150-0001',
      address: '東京都渋谷区神宮前1-1-1',
      phone: '090-1234-5678',
      status: 'approved',
      reviewedAt: new Date(),
      rank: 'silver',
    },
  })
  console.log('Created publisher: publisher@example.com / publisher123')

  // Create demo programs
  const program1 = await prisma.program.upsert({
    where: { programCode: 'PRG001' },
    update: {},
    create: {
      advertiserId: advertiser.id,
      programName: 'サンプルECサイト',
      programCode: 'PRG001',
      description: '高品質な商品を取り扱う総合ECサイト。幅広いジャンルの商品があり、CVRが高いのが特徴です。',
      promotionText: '最大50%OFF！お得なセール開催中',
      categoryId: categories[0].id,
      landingPageUrl: 'https://example.com/lp',
      commissionType: 'cpa',
      commissionAmount: 1000,
      cookieDurationDays: 30,
      conversionConditions: '商品購入完了',
      deniedConditions: 'キャンセル・返品',
      status: 'active',
      visibility: 'public',
    },
  })

  const program2 = await prisma.program.upsert({
    where: { programCode: 'PRG002' },
    update: {},
    create: {
      advertiserId: advertiser.id,
      programName: 'プレミアム会員登録',
      programCode: 'PRG002',
      description: '月額会員サービスの登録プログラム。継続率が高く、安定した報酬が得られます。',
      promotionText: '初月無料キャンペーン実施中',
      categoryId: categories[0].id,
      landingPageUrl: 'https://example.com/premium',
      commissionType: 'cpa',
      commissionAmount: 2000,
      cookieDurationDays: 45,
      conversionConditions: '有料会員登録完了',
      deniedConditions: '無料期間中の解約',
      status: 'active',
      visibility: 'public',
    },
  })

  console.log('Created demo programs')

  // Create publisher site
  const site = await prisma.publisherSite.upsert({
    where: { id: 'demo-site-1' },
    update: {},
    create: {
      id: 'demo-site-1',
      publisherId: publisher.id,
      siteName: 'サンプルブログ',
      siteUrl: 'https://blog.example.com',
      siteType: 'blog',
      categoryId: categories[0].id,
      description: '日々の生活に役立つ情報を発信するブログです',
      monthlyPv: 50000,
      monthlyUu: 30000,
      status: 'approved',
      reviewedAt: new Date(),
    },
  })
  console.log('Created publisher site')

  // Create partnership
  const partnership = await prisma.partnership.upsert({
    where: {
      programId_publisherId: {
        programId: program1.id,
        publisherId: publisher.id,
      },
    },
    update: {},
    create: {
      programId: program1.id,
      publisherId: publisher.id,
      siteId: site.id,
      status: 'approved',
      reviewedAt: new Date(),
      affiliateCode: 'AFF001DEMO',
      trackingUrl: 'http://localhost:3000/track/click/AFF001DEMO',
    },
  })
  console.log('Created partnership')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
