import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

// Backend session payload interface
export interface BackendSessionPayload {
  email: string
  name: string
  provider: string
  provider_id: string
  username?: string
  image?: string
}

// Extended User interface
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
  }

  interface User extends DefaultUser {
    accessToken?: string
    login?: string
  }
}

// Extended JWT interface
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}