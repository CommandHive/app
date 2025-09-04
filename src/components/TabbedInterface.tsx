/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import ToolsCall from "./ToolCalls";
import EnvironmentVariables from "./EnviormentVariables";
import Terminal from "./Terminal";
import MCPProxyServer from "./MCProxy";
import FileBrowser from "./FileBrowser";
import { autocompletion } from "@codemirror/autocomplete";
import {python} from "@codemirror/lang-python"

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  path: string;
}

interface Tab {
  id: string;
  name: string;
  content: React.ReactNode;
}

interface TabbedInterfaceProps {
  chatId: string;
  chatData?: any;
  messages?: any[];
  activeTab: string; // Add activeTab prop to control from parent
}

interface Tool {
  instance: string;
  name: string;
  description: string;
  parameters: {
    properties: Record<string, any>;
    title: string;
    type: string;
  };
  is_async: boolean;
  output_schema: {
    properties: Record<string, any>;
    required: string[];
    title: string;
    type: string;
  };
}

interface ToolCall {
  id: string;
  name: string;
  description: string;
  params: Record<string, any>;
}

// CodeMirror Editor Component
const CodeMirrorEditor = ({ 
  initialCode, 
  onCopy, 
  copied,
  files = [],
  onSaveFile,
  selectMainPyIfExists
}: { 
  initialCode: string; 
  onCopy: () => void; 
  copied: boolean;
  files?: FileNode[];
  onSaveFile?: (filePath: string, content: string) => Promise<boolean>;
  selectMainPyIfExists?: (files: FileNode[]) => FileNode | null;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isCurrentFileEditable, setIsCurrentFileEditable] = useState(true);
  const [hasUserSelectedFile, setHasUserSelectedFile] = useState(false);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file" && file.content !== undefined) {
      setCurrentCode(file.content);
      setSelectedFile(file.path);
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
      setHasUserSelectedFile(true); // Mark that user has manually selected a file
      
      // Determine if file is editable (only main.py is editable)
      const isMainPy = file.name === "main.py";
      setIsCurrentFileEditable(isMainPy);
      
      // Update the editor content if it exists
      if (editor) {
        editor.setValue(file.content);
        // Set read-only mode for files other than main.py
        editor.setOption("readOnly", !isMainPy);
      }
    }
  };


  useEffect(() => {
    const loadCodeMirror = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="codemirror.min.css"]')) {
          const css = document.createElement('link');
          css.rel = 'stylesheet';
          css.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css';
          document.head.appendChild(css);

          // Load theme CSS
          const themeCss = document.createElement('link');
          themeCss.rel = 'stylesheet';
          themeCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material.min.css';
          document.head.appendChild(themeCss);
        }

        // Load CodeMirror JS if not already loaded
        if (!(window as any).CodeMirror) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Load language modes
          const modes = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/python/python.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js'
          ];

          await Promise.all(modes.map(src => 
            new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.onload = () => resolve();
              script.onerror = reject;
              document.head.appendChild(script);
            })
          ));
        }

        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if ((window as any).CodeMirror && editorRef.current) {
            // Clear the ref content first
            editorRef.current.innerHTML = '';
            
            const cm = (window as any).CodeMirror(editorRef.current, {
              value: currentCode,
              mode: language,
              theme: 'material',
              lineNumbers: true,
              readOnly: false,
              autoCloseBrackets: true,
              matchBrackets: true,
              indentUnit: 2,
              tabSize: 2,
              lineWrapping: true,
              foldGutter: true,
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            });
            cm.setSize('100%', '100%');

            // Verify this is actually CodeMirror v5 
            console.log('CodeMirror version check:', {
              hasToTextArea: typeof cm.toTextArea === 'function',
              hasGetWrapperElement: typeof cm.getWrapperElement === 'function',
              version: (window as any).CodeMirror.version
            });

            setEditor(cm);
            setIsLoading(false);
          } else {
            // Fallback if CodeMirror fails
            console.warn('CodeMirror failed to initialize');
            setIsLoading(false);
          }
        }, 100);
      } catch (error) {
        console.error('Failed to load CodeMirror:', error);
        setIsLoading(false);
      }
    };

    if (editorRef.current) {
      loadCodeMirror();
    }

    // Cleanup
    return () => {
      if (editor) {
        try {
          // For CodeMirror v5: Proper cleanup
          if (typeof editor.toTextArea === 'function') {
            // v5 has toTextArea method
            editor.toTextArea();
          } else if (editor.getWrapperElement) {
            // Alternative cleanup for v5
            const wrapper = editor.getWrapperElement();
            if (wrapper && wrapper.parentNode) {
              wrapper.parentNode.removeChild(wrapper);
            }
          }
        } catch (error) {
          console.warn('CodeMirror cleanup error:', error);
        } finally {
          setEditor(null);
        }
      }
    };
  }, [currentCode]);

  // Update editor content when currentCode changes
  useEffect(() => {
    if (editor && typeof editor.getValue === 'function' && editor.getValue() !== currentCode) {
      try {
        editor.setValue(currentCode);
      } catch (error) {
        console.warn('Error updating editor content:', error);
      }
    }
  }, [editor, currentCode]);

  // Update editor language
  useEffect(() => {
    if (editor && typeof editor.setOption === 'function' && language) {
      try {
        editor.setOption('mode', language);
      } catch (error) {
        console.warn('Error updating editor language:', error);
      }
    }
  }, [editor, language]);

  // Auto-select main.py when files change or component initializes (only if user hasn't manually selected a file)
  useEffect(() => {
    if (files && files.length > 0 && selectMainPyIfExists && !hasUserSelectedFile) {
      const mainPyFile = selectMainPyIfExists(files);
      if (mainPyFile && mainPyFile.content !== undefined) {
        setCurrentCode(mainPyFile.content);
        setSelectedFile(mainPyFile.path);
        setHasUnsavedChanges(false);
        setSaveStatus('idle');
        setIsCurrentFileEditable(true); // main.py is always editable
        
        // Update the editor content if it exists
        if (editor) {
          editor.setValue(mainPyFile.content);
          // Ensure main.py is editable (not read-only)
          editor.setOption("readOnly", false);
        }
      }
    }
  }, [files, selectMainPyIfExists, editor, hasUserSelectedFile]);

  const detectLanguage = (code: string): string => {
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('console.log')) return 'javascript';
    if (code.includes('<html') || code.includes('<div') || code.includes('<!DOCTYPE')) return 'xml';
    if (code.includes('{') && code.includes('}') && code.includes(':')) return 'css';
    return 'javascript';
  };

  // Auto-detect language when code changes
  useEffect(() => {
    const detectedLang = detectLanguage(currentCode);
    if (detectedLang !== language) {
      setLanguage(detectedLang);
    }
  }, [currentCode]);

  const handleFormat = () => {
    if (editor) {
      const cursor = editor.getCursor();
      editor.execCommand('selectAll');
      editor.execCommand('indentAuto');
      editor.setCursor(cursor);
    }
  };

  const getCurrentCode = () => {
    return editor ? editor.getValue() : currentCode;
  };

  const handleCopy = () => {
    const code = getCurrentCode();
    navigator.clipboard.writeText(code);
    onCopy();
  };

  const handleSave = async () => {
    if (!selectedFile || !onSaveFile) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const code = getCurrentCode();
      const success = await onSaveFile(selectedFile, code);
      setSaveStatus(success ? 'saved' : 'error');
      
      if (success) {
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Track content changes to show unsaved indicator
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    if (editor) {
      editor.on('change', () => {
        setHasUnsavedChanges(true);
        setSaveStatus('idle');
      });
    }
  }, [editor]);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
          {selectedFile && !isCurrentFileEditable && (
            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
              Read Only
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedFile && isCurrentFileEditable && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  saveStatus === 'saved'
                    ? "bg-green-100 text-green-800"
                    : saveStatus === 'error'
                    ? "bg-red-100 text-red-800"
                    : hasUnsavedChanges
                    ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {isSaving ? "Saving..." : 
                 saveStatus === 'saved' ? "Saved" :
                 saveStatus === 'error' ? "Error" :
                 hasUnsavedChanges ? "Save*" : "Save"}
              </button>
              <div className="w-px h-4 bg-gray-300"></div>
            </>
          )}
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
          >
            Format
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              copied
                ? "bg-green-100 text-green-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File Browser Sidebar */}
        <div className="w-64 flex-shrink-0">
          {files.length > 0 ? (
            <FileBrowser 
              files={files} 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          ) : (
            <div className="h-full bg-white border-r border-gray-200 flex items-center justify-center">
              <div className="text-center px-4">
                <p className="text-sm text-gray-500">No files generated yet</p>
                <p className="text-xs text-gray-400 mt-1">Files will appear here when Claude Code SDK generates them</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Editor Container */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
            {/* {isLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading editor...</p>
                </div>
              </div>
            ) : ( */}
              <div 
                ref={editorRef}
                className="h-full min-h-0"
                style={{ fontSize: '14px' }}
              />
            {/* )} */}
            
            {/* Fallback text editor if CodeMirror fails */}
            {!isLoading && !editor && (
              <textarea
                value={currentCode}
                readOnly
                className="w-full h-full p-4 font-mono text-sm resize-none border-none focus:outline-none bg-gray-900 text-green-400"
                style={{ fontSize: '14px' }}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>Language: {language}</span>
              <span>Lines: {getCurrentCode().split('\n').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TabbedInterface({
  chatId,
  chatData,
  messages = [],
  activeTab,
}: TabbedInterfaceProps) {
  const { accessToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [chatFiles, setChatFiles] = useState<FileNode[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [deploymentMessage, setDeploymentMessage] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [copiedDeploymentLink, setCopiedDeploymentLink] = useState(false);
  const HARDCODED_DEPLOY_URL =
    "http://localhost:8000/test/server/33717b6a-a36c-4597-b39f-5fd40f2fe79a/mcp";

  // Tool call states
  const [toolCallStates, setToolCallStates] = useState<
    Record<
      string,
      {
        isPaid: boolean;
        amount: string;
        isExecuting: boolean;
        result: { success: boolean; message: string; data?: any } | null;
      }
    >
  >({});

  // Environment variables state
  const [envVars, setEnvVars] = useState<
    Array<{ key: string; value: string; id: string }>
  >([
    { id: "1", key: "API_KEY", value: "example" },
    { id: "2", key: "API_KEY", value: "example" },
    { id: "3", key: "API_KEY", value: "example" },
    { id: "4", key: "API_KEY", value: "example" },
  ]);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: "input" | "output"; content: string }>
  >([
    { type: "output", content: "Welcome to Terminal v1.0.0" },
    { type: "output", content: 'Type "help" for available commands' },
  ]);
  const [currentInput, setCurrentInput] = useState("");

  // Helper function to find and select main.py
  const selectMainPyIfExists = (files: FileNode[]) => {
    const findMainPy = (fileList: FileNode[]): FileNode | null => {
      for (const file of fileList) {
        if (file.type === "file" && file.name === "main.py" && file.content !== undefined) {
          return file;
        }
        if (file.type === "folder" && file.children) {
          const found = findMainPy(file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const mainPyFile = findMainPy(files);
    if (mainPyFile && mainPyFile.content !== undefined) {
      // This will be used by the CodeMirror component
      return mainPyFile;
    }
    return null;
  };

  // Extract tools from API response or messages
  const getToolsFromMessages = (): Tool[] => {
    // First priority: Check tools directly from chatData (from /create API response)
    if (
      chatData?.tools &&
      Array.isArray(chatData.tools) &&
      chatData.tools.length > 0
    ) {
      return chatData.tools;
    }

    // Second priority: Check nested data.tools in chatData
    if (
      chatData?.data?.tools &&
      Array.isArray(chatData.data.tools) &&
      chatData.data.tools.length > 0
    ) {
      return chatData.data.tools;
    }

    // Third priority: Extract from assistant messages (for existing chats)
    const assistantMessages = messages.filter(
      (msg) => msg.type === "assistant"
    );

    // Check all assistant messages for tools, starting from the latest
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const message = assistantMessages[i];

      // First check if message has tools directly in the tools field
      if (
        message?.tools &&
        Array.isArray(message.tools) &&
        message.tools.length > 0
      ) {
        return message.tools;
      }

      // Fallback: try parsing content as JSON for backward compatibility
      if (message?.content) {
        try {
          const parsed = JSON.parse(message.content);
          if (
            parsed.tools &&
            Array.isArray(parsed.tools) &&
            parsed.tools.length > 0
          ) {
            return parsed.tools;
          }
        } catch {
          // Continue to next message if parsing fails
        }
      }
    }

    // Fallback: return empty array
    return [];
  };

  const availableTools = getToolsFromMessages();

  // Load files from backend
  const loadChatFiles = async () => {
    if (!chatId || !accessToken) return;
    
    setLoadingFiles(true);
    try {
      const response = await apiService.getChatFiles(chatId, accessToken);
      if (response?.success) {
        const files = response.files || [];
        setChatFiles(files);
        // Note: main.py auto-selection will be handled by CodeMirror component's useEffect
      }
    } catch (error) {
      console.error('Error loading chat files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Load files when component mounts or chatId changes
  useEffect(() => {
    loadChatFiles();
  }, [chatId, accessToken]);

  // Reload files when messages change (new files may have been generated)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to allow backend file operations to complete
      const timer = setTimeout(() => {
        loadChatFiles();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Auto-select main.py when chatFiles change
  useEffect(() => {
    if (chatFiles && chatFiles.length > 0) {
      // Only auto-select if no file is currently selected or if the selected file is not main.py
      const findMainPy = (files: FileNode[]): FileNode | null => {
        for (const file of files) {
          if (file.type === "file" && file.name === "main.py" && file.content !== undefined) {
            return file;
          }
          if (file.type === "folder" && file.children) {
            const found = findMainPy(file.children);
            if (found) return found;
          }
        }
        return null;
      };

      const mainPyFile = findMainPy(chatFiles);
      if (mainPyFile && mainPyFile.path) {
        // Only set as selected if it's not already selected or if no file is selected
        // This prevents overriding user selection when they manually choose another file
        const isMainPyAlreadySelected = mainPyFile.path === chatFiles.find(f => f.name === "main.py")?.path;
        if (!isMainPyAlreadySelected) {
          // The auto-selection will be handled by the CodeMirror component's useEffect
        }
      }
    }
  }, [chatFiles]);

  // Save file content
  const saveFileContent = async (filePath: string, content: string) => {
    if (!chatId || !accessToken) return false;
    
    try {
      const response = await apiService.updateChatFile(chatId, filePath, content, accessToken);
      if (response?.success) {
        // Update the local file tree with new content
        const updateFileInTree = (files: FileNode[]): FileNode[] => {
          return files.map(file => {
            if (file.type === "file" && file.path === filePath) {
              return { ...file, content };
            } else if (file.type === "folder" && file.children) {
              return { ...file, children: updateFileInTree(file.children) };
            }
            return file;
          });
        };
        
        setChatFiles(prev => updateFileInTree(prev));
        return true;
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
    return false;
  };

  // Initialize tool call states
  const initializeToolCallState = (toolId: string) => {
    if (!toolCallStates[toolId]) {
      setToolCallStates((prev) => ({
        ...prev,
        [toolId]: {
          isPaid: false,
          amount: "",
          isExecuting: false,
          result: null,
        },
      }));
    }
  };

  const updateToolCallState = (
    toolId: string,
    updates: Partial<(typeof toolCallStates)[string]>
  ) => {
    setToolCallStates((prev) => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ...updates,
      },
    }));
  };

  // Environment variables functions
  const addEnvVar = () => {
    const newId = Date.now().toString();
    setEnvVars([...envVars, { id: newId, key: "", value: "" }]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter((env) => env.id !== id));
  };

  const updateEnvVar = (
    id: string,
    field: "key" | "value",
    newValue: string
  ) => {
    setEnvVars(
      envVars.map((env) =>
        env.id === id ? { ...env, [field]: newValue } : env
      )
    );
  };

  const saveEnvVars = () => {
    // In a real app, this would save to backend/localStorage
    console.log("Saving environment variables:", envVars);
    alert("Environment variables saved successfully!");
  };

  // Terminal functions
  const executeCommand = (command: string) => {
    const newHistory = [
      ...terminalHistory,
      { type: "input" as const, content: `$ ${command}` },
    ];

    let output = "";
    switch (command.toLowerCase().trim()) {
      case "help":
        output =
          "Available commands:\n  help - Show this help message\n  clear - Clear terminal\n  date - Show current date\n  echo <text> - Echo text back\n  ls - List directory contents";
        break;
      case "clear":
        setTerminalHistory([]);
        setCurrentInput("");
        return;
      case "date":
        output = new Date().toString();
        break;
      case "ls":
        output = "package.json\nsrc/\nbuild/\nnode_modules/\nREADME.md";
        break;
      default:
        if (command.startsWith("echo ")) {
          output = command.substring(5);
        } else if (command.trim() === "") {
          setTerminalHistory(newHistory);
          setCurrentInput("");
          return;
        } else {
          output = `Command not found: ${command}\nType "help" for available commands`;
        }
    }

    setTerminalHistory([...newHistory, { type: "output", content: output }]);
    setCurrentInput("");
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
    }
  };

  const executeToolCall = async (
    tool: Tool,
    parameters: Record<string, any>
  ): Promise<any> => {
    try {
      const response = await apiService.executeTool(
        chatId,
        tool.name,
        parameters,
        accessToken as string
      );

      if (response?.success) {
        return {
          success: true,
          message: `${tool.name} executed successfully!`,
          data: response.result,
        };
      } else {
        return {
          success: false,
          message: `Failed to execute ${tool.name}: ${
            response?.error || "Unknown error"
          }`,
          data: response,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing ${tool.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: null,
      };
    }
  };

  const handleDeploy = async () => {
    // Hardcoded success flow
    setDeploymentStatus("success");
    setDeploymentMessage("You have successfully deployed MCP server");
    setDeploymentUrl(HARDCODED_DEPLOY_URL);
  };

  const copyDeploymentLink = async () => {
    try {
      await navigator.clipboard.writeText(deploymentUrl);
      setCopiedDeploymentLink(true);
      setTimeout(() => setCopiedDeploymentLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy deployment link:", error);
    }
  };

  // Get latest assistant message with code
  const getLatestMessageWithCode = () => {
    const assistantMessages = messages.filter(
      (msg) => msg.type === "assistant" && msg.code
    );
    return assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1]
      : null;
  };

  // Get latest message deployment status
  const getLatestDeployableStatus = () => {
    const assistantMessages = messages.filter(
      (msg) => msg.type === "assistant"
    );
    const latestMessage =
      assistantMessages.length > 0
        ? assistantMessages[assistantMessages.length - 1]
        : null;
    return latestMessage?.is_deployable ?? false;
  };

  // Extract code from files, prioritizing main.py content over message code
  const extractCodeFromResponse = (): string => {
    // First priority: Check if main.py exists in chatFiles and use its content
    const findMainPy = (files: FileNode[]): FileNode | null => {
      for (const file of files) {
        if (file.type === "file" && file.name === "main.py" && file.content !== undefined) {
          return file;
        }
        if (file.type === "folder" && file.children) {
          const found = findMainPy(file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const mainPyFile = findMainPy(chatFiles);
    if (mainPyFile && mainPyFile.content !== undefined) {
      return mainPyFile.content;
    }

    // Second priority: try to get code from the latest message with code from database
    const latestMessage = getLatestMessageWithCode();

    if (latestMessage?.code) {
      try {
        // Handle JSON-wrapped code
        if (latestMessage.code.startsWith("```json")) {
          const jsonMatch = latestMessage.code.match(
            /```json\n([\s\S]*?)\n```/
          );
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || "No code found in JSON";
          }
        }
        // Return raw code from database message
        return latestMessage.code;
      } catch (error) {
        console.error("Error extracting code from latest message:", error);
        return latestMessage.code || "Error extracting code";
      }
    }

    // Third priority: fallback to chatData if no messages with code exist in database
    if (chatData?.code && messages.length === 0) {
      try {
        if (chatData.code.startsWith("```json")) {
          const jsonMatch = chatData.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || "No code found in JSON";
          }
        }
        return chatData.code;
      } catch (error) {
        console.error("Error extracting code from chatData:", error);
        return chatData.code || "Error extracting code from response";
      }
    }

    return "// No code available yet...\n// Your generated code will appear here";
  };

  const copyToClipboard = async () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ToolCallCard = ({ tool }: { tool: Tool }) => {
    const [parameterValues, setParameterValues] = useState<Record<string, any>>(
      {}
    );

    // Initialize state if not exists using useEffect
    useEffect(() => {
      if (!toolCallStates[tool.name]) {
        initializeToolCallState(tool.name);
      }
    }, [tool.name]);

    const state = toolCallStates[tool.name] || {
      isPaid: false,
      amount: "",
      isExecuting: false,
      result: null,
    };

    // Get parameters from tool schema
    const paramEntries = Object.entries(tool.parameters?.properties || {});

    const updateParameter = (paramName: string, value: any) => {
      setParameterValues((prev) => ({
        ...prev,
        [paramName]: value,
      }));
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
        </div>

        {/* Parameters */}
        {paramEntries.length > 0 && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">
              Parameters:
            </h5>
            <div className="space-y-3">
              {paramEntries.map(([key, paramSchema]) => (
                <div key={key} className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-900">
                    {key}
                    {paramSchema.type && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({paramSchema.type})
                      </span>
                    )}
                  </label>
                  <input
                    type={paramSchema.type === "number" ? "number" : "text"}
                    value={parameterValues[key] || ""}
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
                onChange={(e) =>
                  updateToolCallState(tool.name, { amount: e.target.value })
                }
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
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
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
          <div
            className={`mt-4 p-4 rounded-md border ${
              state.result.success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {state.result.success ? (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h6 className="font-medium text-sm">{state.result.message}</h6>
                {state.result.data && (
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">
                      Response Data:
                    </div>
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content based on activeTab prop
  const renderTabContent = () => {
    switch (activeTab) {
      case "Generated Code":
        // Get the main.py content as initial code if available
        const getInitialCode = (): string => {
          const findMainPy = (files: FileNode[]): FileNode | null => {
            for (const file of files) {
              if (file.type === "file" && file.name === "main.py" && file.content !== undefined) {
                return file;
              }
              if (file.type === "folder" && file.children) {
                const found = findMainPy(file.children);
                if (found) return found;
              }
            }
            return null;
          };

          const mainPyFile = findMainPy(chatFiles);
          return mainPyFile?.content || extractCodeFromResponse();
        };

        return (
          <CodeMirrorEditor
            initialCode={getInitialCode()}
            onCopy={copyToClipboard}
            copied={copied}
            files={chatFiles}
            onSaveFile={saveFileContent}
            selectMainPyIfExists={selectMainPyIfExists}
          />
        );

      case "Tool Calls":
        return <ToolsCall tools={availableTools} onExecute={executeToolCall} />;

      case "Environmental Variables":
        return <EnvironmentVariables />;

      case "Terminal":
        return <Terminal />;

      // case "MCP Proxy Servers":
      //   return <MCPProxyServer/>

      default:
        return (
          <div className="p-6 bg-white h-full">
            <div className="text-center py-8 text-gray-500">
              <p>Tab content not found</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      {/* Success notice for deployment */}
      {deploymentStatus === "success" && (
        <div className="px-6 py-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-green-800">
              The MCP server has been deployed on the URL :
            </span>
            <span className="text-sm font-medium text-green-900">
              {HARDCODED_DEPLOY_URL}
            </span>
            <button
              onClick={copyDeploymentLink}
              className="inline-flex items-center rounded border border-green-300 px-2 py-1 text-xs font-medium text-green-900 hover:bg-green-100"
            >
              {copiedDeploymentLink ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="h-full">{renderTabContent()}</div>
    </div>
  );
}