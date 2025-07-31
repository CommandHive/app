import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { BackendSessionPayload } from '@/types/auth'

async function createBackendSession(user: any, account: any) {
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
  
  let payload: BackendSessionPayload = {
    email: user.email,
    name: user.name,
    provider: account.provider,
    provider_id: account.provider === 'email' ? user.email : account.providerAccountId,
  }

  if (account.provider === 'github') {
    payload.username = user.login || user.name
  }

  if (user.image) {
    payload.image = user.image
  }

  console.log('Creating backend session with payload:', payload)
  console.log('Backend URL:', backendUrl)

  try {
    const response = await fetch(`${backendUrl}/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('Backend response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Backend session created successfully:', data)
      return data.access_token
    } else {
      const errorText = await response.text()
      console.error('Backend session creation failed:', response.status, errorText)
    }
  } catch (error) {
    console.error('Failed to create backend session:', error)
  }
  
  return null
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        secure: false,
        requireTLS: true,
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: process.env.SMTP_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('SignIn callback triggered:', { user: user.email, provider: account?.provider })
      
      if (account) {
        const backendToken = await createBackendSession(user, account)
        if (backendToken) {
          user.accessToken = backendToken
          console.log('Backend token stored in user object')
        } else {
          console.log('Failed to get backend token')
        }
      }
      
      return true
    },
    async session({ session, token, user }) {
      console.log('Session callback triggered')
      
      if (token?.accessToken) {
        session.accessToken = token.accessToken
        console.log('Token found in JWT token')
      } else if (user?.accessToken) {
        session.accessToken = user.accessToken
        console.log('Token found in user object')
      } else {
        console.log('No backend token found')
      }
      
      return session
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback triggered:', { hasUser: !!user, hasAccount: !!account })
      
      if (user?.accessToken) {
        token.accessToken = user.accessToken
        console.log('Backend token stored in JWT token')
      }
      
      return token
    },
  },
})

export { handler as GET, handler as POST }