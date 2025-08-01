const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

export interface User {
  email: string
  display_name: string
  username?: string
  avatar_url?: string
  subscription_tier: string
  is_active: boolean
  wallet_address?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatSessionsResponse {
  success: boolean
  sessions: ChatSession[]
  total: number
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatSessionsResponse {
  success: boolean
  sessions: ChatSession[]
  total: number
}

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  async createSession(userData: {
    email: string
    name?: string
    provider: string
    provider_id: string
    username?: string
    image?: string
  }): Promise<{ access_token: string; user: User } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      return data.success ? { access_token: data.access_token, user: data.user } : null
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  }

  async getAuthStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to get auth status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting auth status:', error)
      return null
    }
  }

  async createChat(prompt: string, token: string, userEmail?: string, chatSessionId?: string): Promise<{ chat_id: string; data?: any } | null> {
    try {
      const payload: any = {
        prompt,
        user_id: userEmail || 'current_user'
      }

      if (chatSessionId) {
        payload.chat_session_id = chatSessionId
      }

      console.log('API createChat - payload:', payload)
      console.log('API createChat - token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
      console.log('API createChat - URL:', `${API_BASE_URL}/chat/create`)

      const response = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      console.log('API createChat - response status:', response.status)
      console.log('API createChat - response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API createChat - error response:', errorText)
        throw new Error(`Failed to create chat: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API createChat - response data:', data)
      return data.success ? { chat_id: data.chat_session_id, data: data } : null
    } catch (error) {
      console.error('Error creating chat:', error)
      return null
    }
  }

  async sendMessage(chatId: string, message: string, token: string): Promise<any> {
    try {
      const payload = {
        chat_id: chatId, // Using chat_session_id as chat_id
        message: message
      }

      console.log('API sendMessage - payload:', payload)
      console.log('API sendMessage - chat_id (session_id):', chatId)

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API sendMessage - error response:', errorText)
        throw new Error(`Failed to send message: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API sendMessage - response data:', data)
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  async getChatHistory(chatId: string, token: string): Promise<any> {
    try {
      console.log('API getChatHistory - chat_id (session_id):', chatId)

      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API getChatHistory - error response:', errorText)
        throw new Error(`Failed to get chat history: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API getChatHistory - response data:', data)
      return data
    } catch (error) {
      console.error('Error getting chat history:', error)
      return null
    }
  }

  async getChatStatus(chatId: string, token: string): Promise<any> {
    try {
      console.log('API getChatStatus - chat_id (session_id):', chatId)

      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API getChatStatus - error response:', errorText)
        throw new Error(`Failed to get chat status: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API getChatStatus - response data:', data)
      return data
    } catch (error) {
      console.error('Error getting chat status:', error)
      return null
    }
  }

  async getChatSessions(token: string): Promise<ChatSessionsResponse | null> {
    try {
      console.log('API getChatSessions - fetching user chat sessions')

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      console.log('API getChatSessions - response status:', response.status)
      console.log('API getChatSessions - response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API getChatSessions - error response:', errorText)
        throw new Error(`Failed to get chat sessions: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API getChatSessions - response data:', data)
      return data
    } catch (error) {
      console.error('Error getting chat sessions:', error)
      return null
    }
  }
}

export const apiService = new ApiService()