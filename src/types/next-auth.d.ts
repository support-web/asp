import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    userType: string
    status: string
    advertiserId?: string
    publisherId?: string
    advertiserStatus?: string
    publisherStatus?: string
  }

  interface Session {
    user: User & {
      id: string
      userType: string
      status: string
      advertiserId?: string
      publisherId?: string
      advertiserStatus?: string
      publisherStatus?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    userType: string
    status: string
    advertiserId?: string
    publisherId?: string
    advertiserStatus?: string
    publisherStatus?: string
  }
}
