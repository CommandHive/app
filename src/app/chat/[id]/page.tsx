'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'
import { apiService } from '@/lib/api'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  code?: string
  next_steps?: string
  is_deployable?: boolean
  timestamp: Date
}

export default function ChatPage() {
  const params = useParams()
  const { user, isAuthenticated, accessToken: sessionToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const chatId = params.id as string

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionToken || !isAuthenticated || !chatId || chatId === 'creating') {
        setIsLoadingMessages(false)
        return
      }

      try {
        const response = await apiService.getMessages(chatId, sessionToken as string)
        console.log('Fetched messages:', response)
        
        if (response && response.success && response.messages) {
          const fetchedMessages: ChatMessage[] = response.messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.next_steps || msg.content,
            code: msg.code,
            next_steps: msg.next_steps,
            is_deployable: msg.is_deployable,
            timestamp: new Date(msg.timestamp || msg.created_at || Date.now())
          }))
          setMessages(fetchedMessages)
        } else {
          // Fallback to initial messages if no messages are fetched
          const initialMessages: ChatMessage[] = []
          setMessages(initialMessages)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        // Fallback to initial messages on error
        const initialMessages: ChatMessage[] = []
        setMessages(initialMessages)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [chatId, sessionToken, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access this chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating your MCP server...</h2>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Chat Window - 30% of screen */}
          <div className="w-[30%] border-r border-gray-300 bg-white">
            <ChatWindow 
              chatId={chatId} 
              messages={messages}
              setMessages={setMessages}
              isLoadingMessages={isLoadingMessages}
            />
          </div>
          
          {/* Tabbed Interface - 70% of screen */}
          <div className="w-[70%] bg-white">
            <TabbedInterface chatId={chatId} messages={messages} />
          </div>
        </div>
      )}
    </div>
  )
}