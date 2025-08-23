/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'
import { apiService } from '@/lib/api'
import Image from "next/image"

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  code?: string
  next_steps?: string
  is_deployable?: boolean
  timestamp: Date
  tools?: any[]
}

export default function ChatPage() {
  const params = useParams()
  const { user, isAuthenticated, accessToken: sessionToken } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [activeTab, setActiveTab] = useState("Generated Code")
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
            timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
            tools: msg.tools || []
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

  const tabs = ["Generated Code", "Tool Calls", "Environmental Variables", "Terminal", "MCP Proxy Servers"]

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
        <div className="flex h-screen pt-[72px]">
          {/* Left Chat Panel - Updated UI */}
          <div className="fixed left-0 top-[72px] w-[491px] h-[calc(100vh-72px)] bg-[#F9FAFB] flex flex-col">
            {/* Chat Header - Updated UI */}
            <div className="px-4 py-[18px] flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center space-x-2">
                
                <span className="text-[16px] font-semibold text-gray-800">Web scraping MCP</span>
              </div>
              <button>
                <Image
                  src={"/menudots.svg"}
                  alt="dots-vertical"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            
            {/* Chat Window - Original component with updated container */}
            <div className="flex-1 min-h-0">
              <ChatWindow 
                chatId={chatId} 
                messages={messages}
                setMessages={setMessages}
                isLoadingMessages={isLoadingMessages}
              />
            </div>
          </div>
          
          {/* Right Panel with Tabs - Updated UI */}
          <div className="w-[calc(100%-491px)] overflow-x-hidden flex flex-col bg-[#EAECF04D] pr-[16px] ml-[491px]">
            {/* Tab Header - Updated UI */}
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

            {/* Tab Content - Original TabbedInterface component */}
            <div className="h-full">
              <div className="h-full">
                <TabbedInterface 
                  chatId={chatId} 
                  messages={messages} 
                  chatData={null}
                  activeTab={activeTab}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}