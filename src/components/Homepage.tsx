/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'

const placeholderTexts = [
  "Describe the MCP server you want to create...",
  "Build a custom API integration server...",
  "Design a data processing pipeline...",
  "Create a monitoring and alerting system...",
  "Develop a file management solution...",
  "Build a database connection server...",
]

const examplePrompts = [
  {
    id: 1,
    title: "Web Scraping Server",
    description: "Create an MCP server that can scrape websites and extract structured data",
    prompt: "Create a web scraping MCP server that can extract product information from e-commerce sites",
    category: "Data Extraction"
  },
  {
    id: 2,
    title: "Database Query Server",
    description: "Build an MCP server for executing SQL queries and database operations",
    prompt: "Build an MCP server that connects to PostgreSQL and executes safe SQL queries",
    category: "Database"
  },
  {
    id: 3,
    title: "File Management Server",
    description: "Create an MCP server for file operations like reading, writing, and organizing files",
    prompt: "Create a file management MCP server that can organize files by type and date",
    category: "File System"
  },
  {
    id: 4,
    title: "API Integration Server",
    description: "Build an MCP server that integrates with external APIs and services",
    prompt: "Build an MCP server that integrates with GitHub API for repository management",
    category: "API Integration"
  },
  {
    id: 5,
    title: "Email Processing Server",
    description: "Create an MCP server for sending, receiving, and processing emails",
    prompt: "Create an email processing MCP server that can send notifications and parse attachments",
    category: "Communication"
  },
  {
    id: 6,
    title: "Image Processing Server",
    description: "Build an MCP server for image manipulation and analysis",
    prompt: "Build an image processing MCP server that can resize, compress, and analyze images",
    category: "Media Processing"
  },
]

const HomePage = () => {
  // Authentication logic from old code
  const { accessToken: sessionToken, isAuthenticated, user: session } = useAuth()
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [selectedExample, setSelectedExample] = useState<number | null>(null)
  const router = useRouter()

  // UI state from new code
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const [hasUserInput, setHasUserInput] = useState(false)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState("")

  // Authentication check from old code
  useEffect(() => {
    console.log('🏠 [Homepage] ===== HOMEPAGE USEEFFECT TRIGGERED =====')
    const sessionTokenStored = localStorage.getItem('session_token')
    const jwtToken = localStorage.getItem('jwt_token')
    console.log('🏠 [Homepage] localStorage session_token found:', !!sessionTokenStored)
    console.log('🏠 [Homepage] localStorage jwt_token found:', !!jwtToken)
    console.log('🏠 [Homepage] sessionToken from hook:', !!sessionToken)
    console.log('🏠 [Homepage] sessionToken (first 20 chars):', sessionToken ? sessionToken.substring(0, 20) + '...' : 'NO TOKEN')
    setLocalStorageToken(sessionTokenStored || jwtToken)
  }, [sessionToken])

  // Search/Create functionality from old code
  const handleSearch = async () => {
    console.log('🔍 [Homepage.handleSearch] ===== HANDLE SEARCH CALLED =====')
    console.log('🔍 [Homepage.handleSearch] Session object:', session)
    console.log('🔍 [Homepage.handleSearch] Session keys:', session ? Object.keys(session) : 'no session')
    console.log('🔍 [Homepage.handleSearch] sessionToken from hook:', sessionToken)
    console.log('🔍 [Homepage.handleSearch] Search query:', inputValue)
    console.log('🔍 [Homepage.handleSearch] isAuthenticated:', isAuthenticated)
    console.log('🔍 [Homepage.handleSearch] localStorage token:', localStorageToken)
    
    // Check for session token first, then fall back to localStorage
    const token = sessionToken || localStorageToken
    console.log('🔍 [Homepage.handleSearch] Final token to use:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
    
    if (!token) {
      console.log('❌ [Homepage.handleSearch] No session token available')
      alert('Please sign in first to create a chat')
      return
    }
    
    if (!inputValue.trim()) {
      console.log('No search query provided')
      alert('Please enter a description for your MCP server')
      return
    }
    
    setIsCreatingChat(true)
    
    // Redirect immediately with the prompt in URL
    const encodedPrompt = encodeURIComponent(inputValue)
    const chatUrl = `/chat/new?prompt=${encodedPrompt}`
    console.log('Redirecting to:', chatUrl)
    router.push(chatUrl)
  }

  const handleExampleClick = (example: typeof examplePrompts[0]) => {
    setInputValue(example.prompt)
    setHasUserInput(true)
    setSelectedExample(example.id)
  }

  // Check authentication from session token hook and localStorage fallback
  const hasToken = sessionToken || localStorageToken
  const authenticatedState = isAuthenticated || hasToken

  // Typewriter effect from new code
  const startTypewriter = useCallback(() => {
    if (isFocused || hasUserInput) {
      setDisplayedText("")
      setIsTyping(false)
      return
    }

    const currentText = placeholderTexts[currentPlaceholderIndex]
    let charIndex = 0
    setDisplayedText("")
    setIsTyping(true)

    const typeCharacter = () => {
      if (isFocused || hasUserInput) {
        setDisplayedText("")
        setIsTyping(false)
        return
      }

      if (charIndex < currentText.length) {
        setDisplayedText(currentText.slice(0, charIndex + 1))
        charIndex++
        typewriterRef.current = setTimeout(typeCharacter, 50)
      } else {
        setIsTyping(false)
        typewriterRef.current = setTimeout(() => {
          setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length)
        }, 2000)
      }
    }

    typeCharacter()
  }, [currentPlaceholderIndex, isFocused, hasUserInput])

  useEffect(() => {
    // Clear any existing timeout
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current)
      typewriterRef.current = null
    }

    startTypewriter()

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current)
        typewriterRef.current = null
      }
    }
  }, [startTypewriter])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHasUserInput(value.length > 0)
  }, [])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Handle Enter key for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <main className="w-[1217px] flex flex-col mx-auto gap-14 mb-10">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-[60px] pt-[192px] max-w-[1010px] mx-auto">
        <div className="text-center w-[596px]">
          <h1 className="text-[40px] font-semibold text-[#14110E] mb-6">
            Build MCP Server In Minutes
            <span className="text-orange-500">.</span>
          </h1>
          <p className="text-[16px] font-normal text-[#667085]">
            Describe what you want to build and we&apos;ll generate an MCP server for you with full implementation and documentation.
          </p>
        </div>

        {/* Main input box with integrated controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-w-[802px] w-full overflow-hidden relative">
          {/* Textarea with typewriting effect */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              placeholder=""
              disabled={!authenticatedState}
              className="h-40 resize-none focus-visible:ring-orange-500 border-0 rounded-2xl pr-4 pb-20 pt-6 px-6 text-base leading-relaxed"
            />
            {inputValue.length === 0 && !isFocused && (
              <div className="absolute top-6 left-6 pointer-events-none text-gray-500 text-base">
                <span className="transition-opacity duration-300">{displayedText}</span>
                {isTyping && <span className="inline-block w-0.5 h-5 bg-orange-500 ml-1 animate-pulse"></span>}
              </div>
            )}

            {/* Controls positioned inside the textarea */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-4">
              <div className="relative">
                <Select defaultValue="claude-sonnet-4">
                  <SelectTrigger className="w-[200px] h-9 bg-gray-50/80 backdrop-blur-sm border-gray-200/60 hover:bg-gray-100/80 transition-colors text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse"></div>
                      <SelectValue placeholder="Choose a model" />
                    </div>
                    <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Claude Sonnet 4
                      </div>
                    </SelectItem>
                    <SelectItem value="claude-sonnet-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Claude Sonnet 3
                      </div>
                    </SelectItem>
                    <SelectItem value="gpt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        GPT-4
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSearch}
                disabled={!authenticatedState || !inputValue.trim() || isCreatingChat}
                className={`h-9 px-4 flex items-center gap-2 font-medium rounded-lg text-sm shadow-sm ${
                  authenticatedState && inputValue.trim() && !isCreatingChat
                    ? 'bg-[#FDB022] hover:bg-[#FDB022]/90 text-[#101323]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                }`}
              >
                {isCreatingChat ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#101323] border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Start Creating
                    <Image src="/arrow-up-right.svg" alt="arrow-right" width={16} height={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Login Message */}
        {!authenticatedState && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg max-w-[802px] w-full">
            <p className="text-yellow-800 text-center">
              Please sign in to create MCP servers
            </p>
          </div>
        )}
      </div>

      {/* Demo Video Button */}
      <div className="flex flex-col items-center gap-8">  
        <button className="h-12 px-[18px] flex items-center gap-2 py-[10px] border-[#D0D5DD] w-[208px] border rounded-lg text-[#333F53] hover:bg-gray-50 bg-transparent">
          <Image
            src={"/play-icon.svg"}
            alt="play-icon"
            width={20}
            height={20}
          />
          Watch Demo Video
        </button>

        {/* Example Prompts Section */}
        <div className="text-[#98A2B3] text-[14px] font-normal">
          or
        </div>
        <div className="text-center">
          <h2 className="text-[22px] font-medium text-gray-600 flex items-center gap-2">
            <Image
              src={"/sparkle.svg"}
              alt="sparkle"
              width={24}
              height={24}
            />
            Try our example prompts
          </h2>
        </div>

        {/* Example Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examplePrompts.map((example) => (
            <div
              key={example.id}
              onClick={() => handleExampleClick(example)}
              className={`bg-white rounded-lg p-[16px] hover:shadow-md transition-all cursor-pointer border-2 ${
                selectedExample === example.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-[16px] text-black">{example.title}</h3>
                  <div className="bg-[#F2F4F7] text-[11px] font-medium flex items-center gap-2 text-gray-500 py-1 px-3 rounded-lg">
                    <Image
                      src={"/store-icon.svg"}
                      alt="category-icon"
                      width={12}
                      height={12}
                    />
                    {example.category}
                  </div>
                </div>
                <p className="text-sm text-gray-700 opacity-90 leading-relaxed">{example.description}</p>
                <div className="text-xs text-orange-600 font-medium mt-1">
                  "{example.prompt}"
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default HomePage