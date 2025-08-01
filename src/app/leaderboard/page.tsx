'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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
    name: 'Cryptocurrency Monitor',
    description: 'Real-time crypto market analysis with portfolio tracking and alerts',
    repoLink: 'https://github.com/crypto/monitor-mcp',
    mcpServerLink: 'mcp://cryptocurrency-monitor.mcpserver.dev',
    author: 'CryptoTrack Solutions',
    totalEarnings: 1543.70
  },
  {
    id: '22',
    name: 'Educational Content Helper',
    description: 'Curriculum development tools with adaptive learning algorithms',
    repoLink: 'https://github.com/edutech/helper-mcp',
    mcpServerLink: 'mcp://educational-content-helper.mcpserver.dev',
    author: 'EduTech Innovations',
    totalEarnings: 1432.55
  },
  {
    id: '23',
    name: 'Travel Planning Assistant',
    description: 'Smart travel itinerary creation with cost optimization and local insights',
    repoLink: 'https://github.com/travel/assistant-mcp',
    mcpServerLink: 'mcp://travel-planning-assistant.mcpserver.dev',
    author: 'TravelSmart Co',
    totalEarnings: 1321.40
  },
  {
    id: '24',
    name: 'Legal Document Processor',
    description: 'Automated legal document analysis and contract review system',
    repoLink: 'https://github.com/legaltech/processor-mcp',
    mcpServerLink: 'mcp://legal-document-processor.mcpserver.dev',
    author: 'LegalAI Solutions',
    totalEarnings: 1210.25
  },
  {
    id: '25',
    name: 'Weather API Server',
    description: 'Provides weather data and forecasts',
    repoLink: 'https://github.com/current-user/weather-mcp',
    mcpServerLink: 'mcp://weather-api-server.mcpserver.dev',
    author: 'Current User',
    totalEarnings: 537.80,
    isCurrentUser: true
  }
]

// Sort by total earnings in descending order
const sortedData = [...placeholderData].sort((a, b) => b.totalEarnings - a.totalEarnings)

export default function Leaderboard() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

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

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      if (session) {
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
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const displayedLeaderboard = session ? leaderboard : leaderboard.slice(0, 20)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MCP Server Leaderboard</h1>
          <p className="mt-2 text-gray-600">Top performing MCP servers ranked by total earnings</p>
          {session && userRank && (
            <p className="mt-2 text-blue-600 font-medium">Your ranking: #{userRank}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Servers</h3>
            <p className="text-3xl font-bold text-blue-600">{session ? leaderboard.length : '20+'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Top Earner</h3>
            <p className="text-3xl font-bold text-green-600">
              ${displayedLeaderboard[0]?.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Ecosystem Value</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${displayedLeaderboard.reduce((sum, entry) => sum + entry.totalEarnings, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {session ? 'Full Rankings' : 'Top 20 Rankings'}
            </h2>
            {!session && (
              <p className="text-sm text-gray-500 mt-1">
                <Link href="/api/auth/signin" className="text-blue-600 hover:text-blue-800">
                  Sign in
                </Link> to see the full leaderboard and your ranking
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MCP Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MCP Server Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repository
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedLeaderboard.map((entry, index) => {
                  const isCurrentUser = entry.isCurrentUser && session
                  const showEllipsis = session && index > 20 && index < (userRank || 0) - 3
                  const shouldShow = !showEllipsis && (index < 20 || (session && (index >= (userRank || 0) - 3 && index <= (userRank || 0) + 1)))
                  
                  if (showEllipsis && index === 21) {
                    return (
                      <tr key="ellipsis" className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          ... {(userRank || 0) - 24} more servers ...
                        </td>
                      </tr>
                    )
                  }
                  
                  if (!shouldShow && !showEllipsis) {
                    return null
                  }
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-900'}`}>
                            #{index + 1}
                          </span>
                          {index === 0 && <span className="ml-2 text-yellow-500">🏆</span>}
                          {index === 1 && <span className="ml-2 text-gray-400">🥈</span>}
                          {index === 2 && <span className="ml-2 text-yellow-600">🥉</span>}
                          {isCurrentUser && <span className="ml-2 text-blue-500">👤</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className={`text-sm font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                            {entry.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {entry.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ${entry.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <code 
                            className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 cursor-default"
                            title={entry.mcpServerLink}
                          >
                            {shortenMcpLink(entry.mcpServerLink)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(entry.mcpServerLink)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              copiedLink === entry.mcpServerLink
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedLink === entry.mcpServerLink ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={entry.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
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

        {!session && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Want to see your ranking?</h3>
            <p className="text-blue-800 mb-4">Sign in to view the complete leaderboard and see where your MCP servers rank!</p>
            <Link
              href="/api/auth/signin"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}