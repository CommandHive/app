/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

interface LeaderboardEntry {
  id: string
  name: string
  description: string
  repoLink: string
  mcpServerLink: string
  author: string
  totalEarnings: number
  isCurrentUser?: boolean
}

const placeholderData: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'AI Image Generator Pro',
    description: 'Advanced AI-powered image generation with custom styles and high resolution output',
    repoLink: 'https://github.com/ai-dev/image-generator-mcp',
    mcpServerLink: 'mcp://ai-image-generator-pro.mcpserver.dev',
    author: 'AI Developer Studio',
    totalEarnings: 15420.50
  },
  {
    id: '2',
    name: 'Database Analytics Suite',
    description: 'Comprehensive database analysis, query optimization, and performance monitoring tools',
    repoLink: 'https://github.com/dbtools/analytics-mcp',
    mcpServerLink: 'mcp://database-analytics.mcpserver.dev',
    author: 'DatabasePro Inc',
    totalEarnings: 12850.75
  },
  {
    id: '3',
    name: 'Weather Intelligence API',
    description: 'Real-time weather data with advanced forecasting and climate analysis',
    repoLink: 'https://github.com/weather-co/intelligence-mcp',
    mcpServerLink: 'mcp://weather-intelligence.mcpserver.dev',
    author: 'WeatherTech Solutions',
    totalEarnings: 9876.25
  },
  {
    id: '4',
    name: 'Code Review Assistant',
    description: 'AI-powered code analysis, bug detection, and security vulnerability scanning',
    repoLink: 'https://github.com/codereviewer/assistant-mcp',
    mcpServerLink: 'mcp://code-review-assistant.mcpserver.dev',
    author: 'CodeGuard Labs',
    totalEarnings: 8432.90
  },
  {
    id: '5',
    name: 'Financial Data Processor',
    description: 'Real-time financial market data, trading signals, and portfolio analysis',
    repoLink: 'https://github.com/fintech/data-processor-mcp',
    mcpServerLink: 'mcp://financial-data-processor.mcpserver.dev',
    author: 'FinTech Innovations',
    totalEarnings: 7654.30
  },
  {
    id: '6',
    name: 'Language Translation Hub',
    description: 'Multi-language translation with context awareness and cultural adaptation',
    repoLink: 'https://github.com/translate/hub-mcp',
    mcpServerLink: 'mcp://language-translation-hub.mcpserver.dev',
    author: 'GlobalLingo Corp',
    totalEarnings: 6543.85
  },
  {
    id: '7',
    name: 'Document Intelligence',
    description: 'Advanced document parsing, OCR, and intelligent content extraction',
    repoLink: 'https://github.com/docai/intelligence-mcp',
    mcpServerLink: 'mcp://document-intelligence.mcpserver.dev',
    author: 'DocumentAI Systems',
    totalEarnings: 5432.70
  },
  {
    id: '8',
    name: 'Social Media Analytics',
    description: 'Comprehensive social media monitoring, sentiment analysis, and trend detection',
    repoLink: 'https://github.com/social-analytics/mcp-server',
    mcpServerLink: 'mcp://social-media-analytics.mcpserver.dev',
    author: 'SocialMetrics Inc',
    totalEarnings: 4987.45
  },
  {
    id: '9',
    name: 'E-commerce Optimizer',
    description: 'Product recommendation engine with price optimization and inventory management',
    repoLink: 'https://github.com/ecom/optimizer-mcp',
    mcpServerLink: 'mcp://ecommerce-optimizer.mcpserver.dev',
    author: 'CommerceBoost',
    totalEarnings: 4321.60
  },
  {
    id: '10',
    name: 'Video Processing Suite',
    description: 'Video analysis, transcription, and automated editing with AI enhancement',
    repoLink: 'https://github.com/video-pro/suite-mcp',
    mcpServerLink: 'mcp://video-processing-suite.mcpserver.dev',
    author: 'VideoTech Solutions',
    totalEarnings: 3876.20
  },
  {
    id: '11',
    name: 'Healthcare Data Analyzer',
    description: 'Medical data analysis, patient record processing, and health trend insights',
    repoLink: 'https://github.com/healthtech/analyzer-mcp',
    mcpServerLink: 'mcp://healthcare-data-analyzer.mcpserver.dev',
    author: 'MedTech Innovations',
    totalEarnings: 3654.85
  },
  {
    id: '12',
    name: 'IoT Device Manager',
    description: 'Internet of Things device monitoring, control, and automation platform',
    repoLink: 'https://github.com/iot-manager/mcp-server',
    mcpServerLink: 'mcp://iot-device-manager.mcpserver.dev',
    author: 'IoT Solutions Ltd',
    totalEarnings: 3210.45
  },
  {
    id: '13',
    name: 'Email Marketing Engine',
    description: 'Automated email campaigns with personalization and analytics tracking',
    repoLink: 'https://github.com/email-engine/mcp-server',
    mcpServerLink: 'mcp://email-marketing-engine.mcpserver.dev',
    author: 'MarketingAutomation Co',
    totalEarnings: 2987.90
  },
  {
    id: '14',
    name: 'Cybersecurity Scanner',
    description: 'Network vulnerability assessment and threat detection system',
    repoLink: 'https://github.com/cybersec/scanner-mcp',
    mcpServerLink: 'mcp://cybersecurity-scanner.mcpserver.dev',
    author: 'SecureNet Technologies',
    totalEarnings: 2765.30
  },
  {
    id: '15',
    name: 'Content Generation AI',
    description: 'Automated content creation for blogs, articles, and marketing materials',
    repoLink: 'https://github.com/content-ai/generator-mcp',
    mcpServerLink: 'mcp://content-generation-ai.mcpserver.dev',
    author: 'ContentCraft Studio',
    totalEarnings: 2543.75
  },
  {
    id: '16',
    name: 'Supply Chain Tracker',
    description: 'End-to-end supply chain monitoring with predictive analytics',
    repoLink: 'https://github.com/supply-chain/tracker-mcp',
    mcpServerLink: 'mcp://supply-chain-tracker.mcpserver.dev',
    author: 'LogisticsPro Inc',
    totalEarnings: 2321.60
  },
  {
    id: '17',
    name: 'Voice Recognition System',
    description: 'Advanced voice-to-text conversion with speaker identification',
    repoLink: 'https://github.com/voice-rec/system-mcp',
    mcpServerLink: 'mcp://voice-recognition-system.mcpserver.dev',
    author: 'VoiceTech Solutions',
    totalEarnings: 2198.40
  },
  {
    id: '18',
    name: 'Real Estate Analyzer',
    description: 'Property valuation, market analysis, and investment opportunity identification',
    repoLink: 'https://github.com/realestate/analyzer-mcp',
    mcpServerLink: 'mcp://real-estate-analyzer.mcpserver.dev',
    author: 'PropertyTech Ventures',
    totalEarnings: 1987.25
  },
  {
    id: '19',
    name: 'News Aggregator Pro',
    description: 'Intelligent news collection, categorization, and bias detection system',
    repoLink: 'https://github.com/news-agg/pro-mcp',
    mcpServerLink: 'mcp://news-aggregator-pro.mcpserver.dev',
    author: 'NewsFlow Technologies',
    totalEarnings: 1876.80
  },
  {
    id: '20',
    name: 'Fitness Tracking API',
    description: 'Comprehensive fitness data analysis and personalized workout recommendations',
    repoLink: 'https://github.com/fitness/tracking-mcp',
    mcpServerLink: 'mcp://fitness-tracking-api.mcpserver.dev',
    author: 'FitTech Innovations',
    totalEarnings: 1654.95
  },
  {
    id: '21',
    name: 'Weather API Server',
    description: 'Provides weather data and forecasts for global locations',
    repoLink: 'https://github.com/current-user/weather-mcp',
    mcpServerLink: 'mcp://weather-api-server.mcpserver.dev',
    author: 'Current User',
    totalEarnings: 537.80,
    isCurrentUser: true
  }
]

// Sort by total earnings in descending order
const sortedData = [...placeholderData].sort((a, b) => b.totalEarnings - a.totalEarnings)

const LeaderboardPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<string>('last30days')

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(text)
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const shortenMcpLink = (link: string) => {
    // Extract the server name from mcp://server-name.mcpserver.dev
    const match = link.match(/mcp:\/\/([^.]+)/)
    if (match) {
      const serverName = match[1]
      if (serverName.length > 15) {
        return `mcp://${serverName.substring(0, 12)}...`
      }
      return `mcp://${serverName}...`
    }
    return link.length > 20 ? `${link.substring(0, 17)}...` : link
  }

  const shortenDescription = (description: string) => {
    if (description.length > 50) {
      return `${description.substring(0, 47)}...`
    }
    return description
  }

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      if (isAuthenticated) {
        // Show full leaderboard with user's position
        setLeaderboard(sortedData)
        const userIndex = sortedData.findIndex(entry => entry.isCurrentUser)
        setUserRank(userIndex >= 0 ? userIndex + 1 : null)
      } else {
        // Show only top 20 for non-logged in users
        setLeaderboard(sortedData.slice(0, 20))
      }
      setLoading(false)
    }, 1000)
  }, [isAuthenticated, timePeriod])

  if (loading) {
    return (
      <main className="pt-[112px] flex justify-center mb-10">
        <div className="max-w-[1216px] w-full flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </main>
    )
  }

  const displayedLeaderboard = isAuthenticated ? leaderboard : leaderboard.slice(0, 20)
  const totalServers = isAuthenticated ? leaderboard.length : 2245
  const topEarner = displayedLeaderboard[0]?.totalEarnings || 0
  const totalEcosystemValue = displayedLeaderboard.reduce((sum, entry) => sum + entry.totalEarnings, 0)

  return (
    <main className="pt-[112px] flex justify-center mb-10">
      <div className="max-w-[1216px] w-full flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-2 max-w-[595px]">
          <h1 className="text-[32px] font-semibold text-[#14110E]">
            MCP Server Leaderboard
          </h1>
          <p className="text-[16px] text-gray-500">
            Top performing MCP servers ranked by total earnings across the ecosystem. {isAuthenticated && userRank && `Your current ranking: #${userRank}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Servers */}
          <div className="bg-gray-800 rounded-[12px] p-3 text-white">
            <div className="flex flex-col gap-6">
              <div className="w-[60px] h-[60px] bg-gray-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/lbmcp.svg"
                  alt="servers"
                  width={36}
                  height={36}
                  className=""
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-medium text-white">Total Servers</span>
                <div className="text-[28px] font-semibold text-white">
                  {isAuthenticated ? totalServers.toLocaleString() : '2,245+'}
                </div>
              </div>
            </div>
          </div>

          {/* Top Earner */}
          <div className="bg-white rounded-[12px] p-3 text-white border border-gray-100">
            <div className="flex flex-col gap-6">
              <div className="w-[60px] h-[60px] bg-[#EAECF5] rounded-lg flex items-center justify-center">
                <Image
                  src="/lbearning.svg"
                  alt="servers"
                  width={36}
                  height={36}
                  className=""
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-medium text-gray-500">Top Earner</span>
                <div className="text-[28px] font-semibold text-black">
                  ${topEarner.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Average Earnings */}
          <div className="bg-white rounded-[12px] p-3 text-white border border-gray-100">
            <div className="flex flex-col gap-6">
              <div className="w-[60px] h-[60px] bg-[#EAECF5] rounded-lg flex items-center justify-center">
                <Image
                  src="/lbearning.svg"
                  alt="servers"
                  width={36}
                  height={36}
                  className=""
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-medium text-gray-500">Average Earnings</span>
                <div className="text-[28px] font-semibold text-black">
                  ${displayedLeaderboard.length > 0 ? (totalEcosystemValue / displayedLeaderboard.length).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Total Ecosystem Value */}
          <div className="bg-white rounded-[12px] p-3 text-white border border-gray-100">
            <div className="flex flex-col gap-6">
              <div className="w-[60px] h-[60px] bg-[#EAECF5] rounded-lg flex items-center justify-center">
                <Image
                  src="/lbtotalecosystem.svg"
                  alt="servers"
                  width={36}
                  height={36}
                  className=""
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-medium text-gray-500">Total Ecosystem Value</span>
                <div className="text-[28px] font-semibold text-black">
                  ${totalEcosystemValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-[14px] border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between py-4 px-6">
            <h2 className="text-[24px] font-semibold text-black">
              {isAuthenticated ? 'All Rankings' : 'Top 20 Rankings'}
            </h2>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a time period" className="text-[16px] font-semibold text-gray-700 placeholder:text-gray-700" />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                  <SelectItem value="last7days"><span className="text-[16px] font-semibold text-gray-700">Last 7 Days</span></SelectItem>
                  <SelectItem value="last30days"><span className="text-[16px] font-semibold text-gray-700">Last 30 Days</span></SelectItem>
                  <SelectItem value="last90days"><span className="text-[16px] font-semibold text-gray-700">Last 90 Days</span></SelectItem>
                  <SelectItem value="last365days"><span className="text-[16px] font-semibold text-gray-700">Last 365 Days</span></SelectItem>
                  </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {!isAuthenticated && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500">
                {/* <Link href="/api/auth/signin" className="text-blue-600 hover:text-blue-800 underline"> */}
                  Sign in
                 to see the full leaderboard and your ranking
              </p>
            </div>
          )}

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">Rank</th>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">MCP Server Name</th>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">Author</th>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">Total Earnings</th>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">MCP Server Link</th>
                  <th className="px-6 py-4 text-left text-[14px] text-gray-500 font-normal">Repository</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {displayedLeaderboard.map((item, index) => {
                  const isCurrentUser = item.isCurrentUser && isAuthenticated
                  const showEllipsis = isAuthenticated && index > 4 && index < (userRank || 0) - 3
                  const shouldShow = !showEllipsis && (index < 5 || (isAuthenticated && (index >= (userRank || 0) - 3 && index <= (userRank || 0) + 1)))
                  
                  if (showEllipsis && index === 5) {
                    return (
                      <tr key="ellipsis" className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          ... {(userRank || 0) - 9} more servers ...
                        </td>
                      </tr>
                    )
                  }
                  
                  if (!shouldShow && !showEllipsis) {
                    return null
                  }

                  return (
                    <tr 
                      key={item.id} 
                      className={`${isCurrentUser ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-[16px] font-medium ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                          #{index + 1}
                          {index === 0 && <span className="ml-2">🏆</span>}
                          {index === 1 && <span className="ml-2">🥈</span>}
                          {index === 2 && <span className="ml-2">🥉</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className={`text-[16px] font-medium ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                            {item.name}
                          </div>
                          <div className={`text-sm font-medium ${isCurrentUser ? 'text-gray-300' : 'text-gray-500'}`}>
                            {shortenDescription(item.description)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-[16px] ${isCurrentUser ? 'text-white' : 'text-gray-700'} font-medium`}>
                          {item.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[16px] font-bold text-green-600">
                          ${item.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex justify-between items-center gap-2 p-2 ${isCurrentUser ? 'bg-gray-600' : 'bg-gray-200'} rounded-[4px]`}>
                          <span className={`text-sm font-medium ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                            {shortenMcpLink(item.mcpServerLink)}
                          </span>
                          <button 
                            className="rounded-lg"
                            onClick={() => copyToClipboard(item.mcpServerLink)}
                          >
                            <Image
                              src="/copy.svg"
                              alt="copy"
                              width={18}
                              height={18}
                              style={{
                                  filter: isCurrentUser ? 'brightness(0) invert(1)' : 'none'
                              }}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={item.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[16px] font-medium underline ${isCurrentUser ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-500'}`}
                        >
                          View Repository
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {copiedLink && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Link copied to clipboard!
          </div>
        )}
      </div>
    </main>
  );
};

export default LeaderboardPage;