/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  code?: string;
  next_steps?: string;
  is_deployable?: boolean;
  timestamp: Date;
  tools?: any[];
}

interface ChatWindowProps {
  chatId: string;
  initialPrompt?: string;
  isCreatingChat?: boolean;
  chatData?: any;
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  messages?: ChatMessage[];
  setMessages?: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  isLoadingMessages?: boolean;
}

export default function ChatWindow({
  chatId,
  initialPrompt,
  isCreatingChat,
  chatData,
  onMessagesUpdate,
  messages: propMessages = [],
  setMessages: propSetMessages,
  isLoadingMessages: propIsLoadingMessages,
}: ChatWindowProps) {
  const { accessToken: sessionToken, isAuthenticated } = useAuth();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localIsLoadingMessages, setLocalIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use props if available, otherwise fall back to local state
  const messages = propMessages.length > 0 ? propMessages : localMessages;
  const setMessages = propSetMessages || setLocalMessages;
  const isLoadingMessages =
    propIsLoadingMessages !== undefined
      ? propIsLoadingMessages
      : localIsLoadingMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  // Only fetch messages if no props are provided (backward compatibility)
  useEffect(() => {
    if (propMessages.length > 0 || propSetMessages) {
      // Messages are managed by parent component, don't fetch
      return;
    }

    const fetchMessages = async () => {
      if (
        !sessionToken ||
        !isAuthenticated ||
        !chatId ||
        chatId === "creating" ||
        isCreatingChat
      ) {
        setLocalIsLoadingMessages(false);
        return;
      }

      try {
        const response = await apiService.getMessages(
          chatId,
          sessionToken as string
        );
        console.log("Fetched messages:", response);

        if (response && response.success && response.messages) {
          const fetchedMessages: ChatMessage[] = response.messages.map(
            (msg: any) => ({
              id: msg.id || Date.now().toString(),
              type: msg.role === "user" ? "user" : "assistant",
              content: msg.next_steps || msg.content,
              code: msg.code,
              next_steps: msg.next_steps,
              is_deployable: msg.is_deployable,
              timestamp: new Date(
                msg.timestamp || msg.created_at || Date.now()
              ),
              tools: msg.tools || [],
            })
          );
          setLocalMessages(fetchedMessages);
        } else {
          // Fallback to initial messages if no messages are fetched
          const initialMessages: ChatMessage[] = [];

          if (initialPrompt) {
            initialMessages.push({
              id: "1",
              type: "user",
              content: initialPrompt,
              timestamp: new Date(),
            });
          }

          if (!isCreatingChat) {
            initialMessages.push({
              id: "2",
              type: "assistant",
              content:
                "Hello! I've started working on your MCP server. What would you like to know or modify?",
              timestamp: new Date(),
            });
          }

          setLocalMessages(initialMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Fallback to initial messages on error
        const initialMessages: ChatMessage[] = [];

        if (initialPrompt) {
          initialMessages.push({
            id: "1",
            type: "user",
            content: initialPrompt,
            timestamp: new Date(),
          });
        }

        if (!isCreatingChat) {
          initialMessages.push({
            id: "2",
            type: "assistant",
            content:
              "Hello! I've started working on your MCP server. What would you like to know or modify?",
            timestamp: new Date(),
          });
        }

        setLocalMessages(initialMessages);
      } finally {
        setLocalIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [
    chatId,
    sessionToken,
    isAuthenticated,
    isCreatingChat,
    initialPrompt,
    propMessages.length,
    propSetMessages,
  ]);

  useEffect(() => {
    // Add assistant message when chat creation is complete
    if (
      !isCreatingChat &&
      initialPrompt &&
      messages.length === 1 &&
      messages[0].type === "user" &&
      chatData
    ) {
      setTimeout(() => {
        const responseContent =
          chatData.next_steps ||
          "Hello! I've created your MCP server. What would you like to know or modify?";
        const assistantMessage: ChatMessage = {
          id: "2",
          type: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 500); // Small delay for better UX
    }
  }, [isCreatingChat, initialPrompt, messages.length, chatData]);

  const handleSendMessage = async () => {
    if (
      !inputMessage.trim() ||
      !sessionToken ||
      !isAuthenticated ||
      !chatId ||
      chatId === "creating"
    )
      return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    console.log("all messages before sending:", messages);

    setInputMessage("");
    setIsTyping(true);

    try {
      console.log("Sending message to chat_session_id:", chatId);
      console.log("Message content:", inputMessage);
      console.log("Session token:", sessionToken);
      const response = await apiService.sendMessage(
        chatId,
        inputMessage,
        sessionToken as string
      );

      if (response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.next_steps || response.message,
          code: response.code,
          next_steps: response.next_steps,
          is_deployable: response.is_deployable,
          timestamp: new Date(),
          tools: response.tools || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response if API doesn't return a message
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I understand your request. Let me work on that for you...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 ml-3">Loading messages...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-sm prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling for code blocks and inline code
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        const { ref, ...restProps } = props;
                        if (inline) {
                          return (
                            <code
                              className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs"
                              {...restProps}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code
                            className={`block bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-x-auto ${className}`}
                            {...restProps}
                          >
                            {children}
                          </code>
                        );
                      },
                      // Handle pre elements properly
                      pre: ({ node, children, ...props }) => {
                        return <div className="my-2">{children}</div>;
                      },
                      // Style links appropriately
                      a: ({ node, children, ...props }) => (
                        <a
                          className={`underline ${
                            message.type === "user"
                              ? "text-blue-100"
                              : "text-blue-600"
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      ),
                      // Style paragraphs
                      p: ({ node, children, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props}>
                          {children}
                        </p>
                      ),
                      // Style lists
                      ul: ({ node, children, ...props }) => (
                        <ul className="list-disc pl-4 mb-2" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ node, children, ...props }) => (
                        <ol className="list-decimal pl-4 mb-2" {...props}>
                          {children}
                        </ol>
                      ),
                      // Style headers
                      h1: ({ node, children, ...props }) => (
                        <h1 className="text-lg font-bold mb-2" {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ node, children, ...props }) => (
                        <h2 className="text-base font-bold mb-2" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ node, children, ...props }) => (
                        <h3 className="text-sm font-bold mb-1" {...props}>
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {(isTyping || isCreatingChat) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              {isCreatingChat && (
                <p className="text-xs text-gray-500 mt-1">
                  Creating your MCP server...
                </p>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4">
        <div className="flex flex-col bg-white border p-4 gap-2.5 border-gray-200 shadow-sm rounded-[12px] items-center">
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Reply"
              className="w-full h-10 px-3 pr-10 rounded-md focus:ring-0 focus-visible:border-none focus-visible:ring-0 text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-2 w-full">
            <Select defaultValue="claude-sonnet-4">
              <SelectTrigger className="w-[200px] h-9 bg-gray-50/80 backdrop-blur-sm border-gray-200/60 hover:bg-gray-100/80 transition-colors text-sm [&>svg]:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse"></div>
                  <SelectValue placeholder="Choose a model" />
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                </div>
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
            <button
              onClick={handleSendMessage}
              className="h-10 w-10 bg-[#FDB022] hover:bg-[#FDB022]/80 text-white rounded-md flex items-center justify-center"
            >
              <Image
                src={"/arrow-up-right.svg"}
                alt="send"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
