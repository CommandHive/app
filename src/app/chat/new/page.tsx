'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'
import { apiService } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function NewChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, accessToken, isAuthenticated } = useAuth()
  const [isCreatingChat, setIsCreatingChat] = useState(true)
  const [chatId, setChatId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatData, setChatData] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  
  // Prevent double API calls in development (React Strict Mode)
  const hasCreatedChat = useRef(false)
  const isCreating = useRef(false)
  
  const prompt = searchParams.get('prompt') || ''

  useEffect(() => {
    // Early return if not authenticated
    if (!isAuthenticated || !accessToken || !user) {
      setError('Authentication required')
      setIsCreatingChat(false)
      return
    }

    // Prevent double calls
    if (hasCreatedChat.current || isCreating.current) {
      return
    }

    // Mark as creating to prevent race conditions
    isCreating.current = true

    const createChat = async () => {
      try {
        console.log('🆕 [NewChatPage] Creating chat with prompt:', prompt)
        const result = await apiService.createChat(
          prompt, 
          accessToken
        )
        
        if (result?.chat_id) {
          console.log('Chat created successfully with chat_session_id:', result.chat_id)
          console.log('Chat response data:', result.data)
          setChatId(result.chat_id)
          setChatData(result.data)
          // Update URL to the actual chat ID without redirect
          window.history.replaceState({}, '', `/chat/${result.chat_id}`)
          // Mark as successfully created
          hasCreatedChat.current = true
        } else {
          setError('Failed to create chat')
        }
      } catch (error) {
        console.error('Error creating chat:', error)
        setError('Failed to create chat')
        // Reset flags on error so user can retry
        hasCreatedChat.current = false
        isCreating.current = false
      } finally {
        setIsCreatingChat(false)
        isCreating.current = false
      }
    }

    createChat()
  }, [isAuthenticated, accessToken, user, prompt])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              // Reset error state and flags for retry
              setError(null)
              setIsCreatingChat(true)
              hasCreatedChat.current = false
              isCreating.current = false
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Chat Window - 30% of screen */}
        <div className="w-[30%] border-r border-gray-300 bg-white">
          <ChatWindow 
            chatId={chatId || 'creating'} 
            initialPrompt={prompt}
            isCreatingChat={isCreatingChat}
            chatData={chatData}
            onMessagesUpdate={setMessages}
          />
        </div>
        
        {/* Tabbed Interface - 70% of screen */}
        <div className="w-[70%] bg-white">
          {isCreatingChat ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating your MCP server...</h2>
                <p className="text-gray-600">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <TabbedInterface chatId={chatId || ''} chatData={chatData} messages={messages} />
          )}
        </div>
      </div>
    </div>
  )
}