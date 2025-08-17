'use client'

import { useState, useEffect } from 'react'
import { ClipboardIcon, CheckIcon, PlayIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/lib/api'

interface Tab {
  id: string
  name: string
  content: React.ReactNode
}

interface TabbedInterfaceProps {
  chatId: string
  chatData?: any
  messages?: any[]
}

interface Tool {
  instance: string
  name: string
  description: string
  parameters: {
    properties: Record<string, any>
    title: string
    type: string
  }
  is_async: boolean
  output_schema: {
    properties: Record<string, any>
    required: string[]
    title: string
    type: string
  }
}

interface ToolCall {
  id: string
  name: string
  description: string
  params: Record<string, any>
}

export default function TabbedInterface({ chatId, chatData, messages = [] }: TabbedInterfaceProps) {
  const { accessToken } = useAuth()
  const [activeTab, setActiveTab] = useState('tool-calls')
  const [copied, setCopied] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [deploymentMessage, setDeploymentMessage] = useState('')
  const [deploymentUrl, setDeploymentUrl] = useState('')
  const [copiedDeploymentLink, setCopiedDeploymentLink] = useState(false)
  const HARDCODED_DEPLOY_URL = 'http://localhost:8000/test/server/33717b6a-a36c-4597-b39f-5fd40f2fe79a/mcp'
  
  // Tool call states
  const [toolCallStates, setToolCallStates] = useState<Record<string, {
    isPaid: boolean
    amount: string
    isExecuting: boolean
    result: { success: boolean; message: string; data?: any } | null
  }>>({})

  // Environment variables state
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string; id: string }>>([
    { id: '1', key: 'API_KEY', value: 'example' },
    { id: '2', key: 'API_KEY', value: 'example' },
    { id: '3', key: 'API_KEY', value: 'example' },
    { id: '4', key: 'API_KEY', value: 'example' }
  ])

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output'; content: string }>>([
    { type: 'output', content: 'Welcome to Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands' }
  ])
  const [currentInput, setCurrentInput] = useState('')

  // Extract tools from API response or messages
  const getToolsFromMessages = (): Tool[] => {
    // First priority: Check tools directly from chatData (from /create API response)
    if (chatData?.tools && Array.isArray(chatData.tools) && chatData.tools.length > 0) {
      return chatData.tools
    }
    
    // Second priority: Check nested data.tools in chatData
    if (chatData?.data?.tools && Array.isArray(chatData.data.tools) && chatData.data.tools.length > 0) {
      return chatData.data.tools
    }
    
    // Third priority: Extract from assistant messages (for existing chats)
    const assistantMessages = messages.filter(msg => msg.type === 'assistant')
    
    // Check all assistant messages for tools, starting from the latest
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const message = assistantMessages[i]
      
      // First check if message has tools directly in the tools field
      if (message?.tools && Array.isArray(message.tools) && message.tools.length > 0) {
        return message.tools
      }
      
      // Fallback: try parsing content as JSON for backward compatibility
      if (message?.content) {
        try {
          const parsed = JSON.parse(message.content)
          if (parsed.tools && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
            return parsed.tools
          }
        } catch {
          // Continue to next message if parsing fails
        }
      }
    }
    
    // Fallback: return empty array
    return []
  }
  
  const availableTools = getToolsFromMessages()

  // Initialize tool call states
  const initializeToolCallState = (toolId: string) => {
    if (!toolCallStates[toolId]) {
      setToolCallStates(prev => ({
        ...prev,
        [toolId]: {
          isPaid: false,
          amount: '',
          isExecuting: false,
          result: null
        }
      }))
    }
  }

  const updateToolCallState = (toolId: string, updates: Partial<typeof toolCallStates[string]>) => {
    setToolCallStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ...updates
      }
    }))
  }

  // Environment variables functions
  const addEnvVar = () => {
    const newId = Date.now().toString()
    setEnvVars([...envVars, { id: newId, key: '', value: '' }])
  }

  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter(env => env.id !== id))
  }

  const updateEnvVar = (id: string, field: 'key' | 'value', newValue: string) => {
    setEnvVars(envVars.map(env => 
      env.id === id ? { ...env, [field]: newValue } : env
    ))
  }

  const saveEnvVars = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving environment variables:', envVars)
    alert('Environment variables saved successfully!')
  }

  // Terminal functions
  const executeCommand = (command: string) => {
    const newHistory = [...terminalHistory, { type: 'input' as const, content: `$ ${command}` }]
    
    let output = ''
    switch (command.toLowerCase().trim()) {
      case 'help':
        output = 'Available commands:\n  help - Show this help message\n  clear - Clear terminal\n  date - Show current date\n  echo <text> - Echo text back\n  ls - List directory contents'
        break
      case 'clear':
        setTerminalHistory([])
        setCurrentInput('')
        return
      case 'date':
        output = new Date().toString()
        break
      case 'ls':
        output = 'package.json\nsrc/\nbuild/\nnode_modules/\nREADME.md'
        break
      default:
        if (command.startsWith('echo ')) {
          output = command.substring(5)
        } else if (command.trim() === '') {
          setTerminalHistory(newHistory)
          setCurrentInput('')
          return
        } else {
          output = `Command not found: ${command}\nType "help" for available commands`
        }
    }
    
    setTerminalHistory([...newHistory, { type: 'output', content: output }])
    setCurrentInput('')
  }

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput)
    }
  }

  const executeToolCall = async (tool: Tool, parameters: Record<string, any>) => {
    const state = toolCallStates[tool.name]
    if (state?.isPaid && !state.amount) {
      alert('Please enter an amount for paid execution')
      return
    }

    updateToolCallState(tool.name, { isExecuting: true })
    
    try {
      const response = await apiService.executeTool(chatId, tool.name, parameters, accessToken as string)
      
      if (response?.success) {
        updateToolCallState(tool.name, { 
          isExecuting: false,
          result: {
            success: true,
            message: `${tool.name} executed successfully!`,
            data: response.result
          }
        })
      } else {
        updateToolCallState(tool.name, { 
          isExecuting: false,
          result: {
            success: false,
            message: `Failed to execute ${tool.name}: ${response?.error || 'Unknown error'}`,
            data: null
          }
        })
      }
    } catch (error) {
      updateToolCallState(tool.name, { 
        isExecuting: false,
        result: {
          success: false,
          message: `Error executing ${tool.name}: ${error}`,
          data: null
        }
      })
    }
  }
  
  const handleDeploy = async () => {
    // Hardcoded success flow
    setDeploymentStatus('success')
    setDeploymentMessage('You have successfully deployed MCP server')
    setDeploymentUrl(HARDCODED_DEPLOY_URL)
  }

  const copyDeploymentLink = async () => {
    try {
      await navigator.clipboard.writeText(deploymentUrl)
      setCopiedDeploymentLink(true)
      setTimeout(() => setCopiedDeploymentLink(false), 2000)
    } catch (error) {
      console.error('Failed to copy deployment link:', error)
    }
  }

  // Get latest assistant message with code
  const getLatestMessageWithCode = () => {
    const assistantMessages = messages.filter(msg => msg.type === 'assistant' && msg.code)
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
  }

  // Get latest message deployment status
  const getLatestDeployableStatus = () => {
    const assistantMessages = messages.filter(msg => msg.type === 'assistant')
    const latestMessage = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
    return latestMessage?.is_deployable ?? false
  }

  // Extract code from latest message with priority to database messages
  const extractCodeFromResponse = (): string => {
    // First, try to get code from the latest message with code from database
    const latestMessage = getLatestMessageWithCode()
    
    if (latestMessage?.code) {
      try {
        // Handle JSON-wrapped code
        if (latestMessage.code.startsWith('```json')) {
          const jsonMatch = latestMessage.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || 'No code found in JSON';
          }
        }
        // Return raw code from database message
        return latestMessage.code;
      } catch (error) {
        console.error('Error extracting code from latest message:', error)
        return latestMessage.code || 'Error extracting code'
      }
    }
    
    // Only fallback to chatData if no messages with code exist in database
    if (chatData?.code && messages.length === 0) {
      try {
        if (chatData.code.startsWith('```json')) {
          const jsonMatch = chatData.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || 'No code found in JSON';
          }
        }
        return chatData.code;
      } catch (error) {
        console.error('Error extracting code from chatData:', error)
        return chatData.code || 'Error extracting code from response'
      }
    }
    
    return 'No code available yet...'
  }

  const copyToClipboard = async () => {
    const code = extractCodeFromResponse()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const ToolCallCard = ({ tool }: { tool: Tool }) => {
    const [parameterValues, setParameterValues] = useState<Record<string, any>>({})
    
    // Initialize state if not exists using useEffect
    useEffect(() => {
      if (!toolCallStates[tool.name]) {
        initializeToolCallState(tool.name)
      }
    }, [tool.name])

    const state = toolCallStates[tool.name] || { isPaid: false, amount: '', isExecuting: false, result: null }
    
    // Get parameters from tool schema
    const paramEntries = Object.entries(tool.parameters?.properties || {})
    
    const updateParameter = (paramName: string, value: any) => {
      setParameterValues(prev => ({
        ...prev,
        [paramName]: value
      }))
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
        </div>
        
        {/* Parameters */}
        {paramEntries.length > 0 && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Parameters:</h5>
            <div className="space-y-3">
              {paramEntries.map(([key, paramSchema]) => (
                <div key={key} className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-900">
                    {key}
                    {paramSchema.type && (
                      <span className="text-xs text-gray-500 ml-1">({paramSchema.type})</span>
                    )}
                  </label>
                  <input
                    type={paramSchema.type === 'number' ? 'number' : 'text'}
                    value={parameterValues[key] || ''}
                    onChange={(e) => updateParameter(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder={paramSchema.description || `Enter ${key}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Options and Execute Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
            
            {/* Amount Input (conditional) */}
            {state.isPaid && (
              <input
                type="number"
                placeholder="Amount"
                value={state.amount}
                onChange={(e) => updateToolCallState(tool.name, { amount: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Execute Button */}
          <button
            onClick={() => executeToolCall(tool, parameterValues)}
            disabled={state.isExecuting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              state.isExecuting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {state.isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
        
        {/* Result Display */}
        {state.result && (
          <div className={`mt-4 p-4 rounded-md border ${
            state.result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {state.result.success ? (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h6 className="font-medium text-sm">{state.result.message}</h6>
                {state.result.data && (
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Response Data:</div>
                    <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto font-mono">
                      {JSON.stringify(state.result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <button
                onClick={() => updateToolCallState(tool.name, { result: null })}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const tabs: Tab[] = [
    {
      id: 'code',
      name: 'Generated Code',
      content: (
        <div className="p-6 h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">MCP Server Code</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-[calc(100%-5rem)] overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {extractCodeFromResponse()}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'info',
      name: 'Info',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Information</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Chat Session ID: {chatId}</p>
              <p className="text-xs text-gray-400 mt-1">This ID will be used as chat_id in API calls</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Status: {getLatestDeployableStatus() ? 'Deployable' : 'In Progress'}</p>
              {chatData?.usage && (
                <p className="text-xs text-blue-500 mt-1">
                  Tokens used: {chatData.usage.total_tokens} ({chatData.usage.prompt_tokens} prompt + {chatData.usage.completion_tokens} completion)
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={handleDeploy}
                  disabled={!getLatestDeployableStatus()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    getLatestDeployableStatus()
                      ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {getLatestDeployableStatus() ? 'Deploy Server' : 'Not Ready for Deployment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tool-calls',
      name: 'Tool Calls',
      content: (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Available Tool Calls</h3>
            <div className="text-sm text-gray-500">
              {availableTools.length} tool{availableTools.length !== 1 ? 's' : ''} available
            </div>
          </div>
          <div className="space-y-6">
            {availableTools.length > 0 ? (
              availableTools.map((tool) => (
                <ToolCallCard key={tool.name} tool={tool} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No tools available yet</p>
                <p className="text-sm mt-2">Tools will appear here once your MCP server code is generated</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'env-vars',
      name: 'Environmental Variables',
      content: (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Environmental Variables</h3>
              <div className="bg-gray-100 rounded-full p-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addEnvVar}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={saveEnvVars}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Save All
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {envVars.map((envVar, index) => (
              <div key={envVar.id} className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name:</label>
                  <input
                    type="text"
                    placeholder="e.g, API_KEY"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(envVar.id, 'key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variable Value:</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="e.g, example"
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(envVar.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeEnvVar(envVar.id)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {envVars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No environment variables configured.</p>
                <p className="text-sm mt-1">Click the + button to get started.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      name: 'Terminal',
      content: (
        <div className="h-full bg-black text-green-400 font-mono text-sm">
          <div className="p-4 h-full flex flex-col">
            {/* Terminal Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-300 text-xs ml-4">Terminal — chat-{chatId}</span>
              </div>
              <button
                onClick={() => setTerminalHistory([])}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Clear
              </button>
            </div>
            
            {/* Terminal Content */}
            <div className="flex-1 overflow-y-auto mb-4">
              {terminalHistory.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry.type === 'input' ? (
                    <div className="text-green-400">{entry.content}</div>
                  ) : (
                    <div className="text-gray-300 whitespace-pre-line">{entry.content}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Terminal Input */}
            <div className="flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                className="flex-1 bg-transparent text-green-400 border-none outline-none font-mono"
                placeholder="Type a command..."
                autoFocus
              />
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header with Deploy Button */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">MCP Server Interface</h2>
          <p className="text-sm text-gray-600">Manage your server code, tools, and deployment</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Keeping header clear; success notice shown below above tabs */}
          {deploymentStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-sm text-red-800">{deploymentMessage}</p>
            </div>
          )}
          <button
            onClick={handleDeploy}
            disabled={!getLatestDeployableStatus() || deploymentStatus === 'deploying'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !getLatestDeployableStatus() || deploymentStatus === 'deploying'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {deploymentStatus === 'deploying' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Deploy Server</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Success notice above tabs */}
      {deploymentStatus === 'success' && (
        <div className="px-6 py-3 bg-green-50 border-y border-green-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-green-800">The MCP server has been deployed on the URL :</span>
            <span className="text-sm font-medium text-green-900">{HARDCODED_DEPLOY_URL}</span>
            <button
              onClick={copyDeploymentLink}
              className="inline-flex items-center rounded border border-green-300 px-2 py-1 text-xs font-medium text-green-900 hover:bg-green-100"
            >
              {copiedDeploymentLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}