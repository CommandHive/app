// Auth types for the new JWT-based authentication system

export interface User {
  id?: string
  email: string
  display_name: string
  username?: string
  avatar_url?: string
  subscription_tier: string
  is_active: boolean
  wallet_address?: string
}

export interface AuthResponse {
  success: boolean
  access_token: string
  token_type: string
  expires_in: number
  user: User
  error?: string
}