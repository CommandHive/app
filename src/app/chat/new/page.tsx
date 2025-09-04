'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'
import { apiService } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function NewChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, accessToken, isAuthenticated } = useAuth()
  const [isCreatingChat, setIsCreatingChat] = useState(true)
  const [chatId, setChatId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatData, setChatData] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("Generated Code")

  const hasCreatedChat = useRef(false)
  const isCreating = useRef(false)

  const prompt = searchParams.get('prompt') || ''

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      setError('Authentication required')
      setIsCreatingChat(false)
      return
    }

    if (hasCreatedChat.current || isCreating.current) {
      return
    }

    isCreating.current = true

    const createChat = async () => {
      try {
        const result = await apiService.createChat(
          prompt,
          accessToken
        )

        if (result?.chat_id) {
          setChatId(result.chat_id)
          setChatData(result.data)
          window.history.replaceState({}, '', `/chat/${result.chat_id}`)
          hasCreatedChat.current = true
        } else {
          setError('Failed to create chat')
        }
      } catch (error) {
        setError('Failed to create chat')
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

  const tabs = ["Generated Code", "Tool Calls", "Environmental Variables", "Terminal"]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-[calc(100vh-72px)] mt-[72px]">
        <div className="w-[30%] border-r border-gray-300 bg-white">
          <ChatWindow
            chatId={chatId || 'creating'}
            initialPrompt={prompt}
            isCreatingChat={isCreatingChat}
            chatData={chatData}
            onMessagesUpdate={setMessages}
          />
        </div>

        <div className="w-[70%] bg-white flex flex-col">
          {isCreatingChat ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating your MCP server...</h2>
                <p className="text-gray-600">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Header */}
              <div className="border-b border-gray-200">
                <div className="flex items-center">
                  {tabs.map((tab) => (
                    <div key={tab} className="border-r border-gray-300 hover:bg-gray-200">  
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-[16px] text-[16px] font-medium transition-colors ${
                          activeTab === tab
                            ? "border-gray-600 bg-gray-200 border-b-4 text-gray-600 font-semibold"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                      </button>
                    </div>
                  ))}
                  <div className="ml-auto">
                    <button className="px-4 py-[10px] bg-[#FDB022] hover:bg-[#FDB022]/80 text-black text-[16px] font-semibold rounded-lg">
                      Deploy
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                <TabbedInterface chatId={chatId || ''} chatData={chatData} messages={messages} activeTab={activeTab} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <NewChatContent />
    </Suspense>
  )
}