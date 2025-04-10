import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    phone?: string | null
    address?: string | null
    isAdmin: boolean
  }

  interface Session {
    user: User
  }
} 