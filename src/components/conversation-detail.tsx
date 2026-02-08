"use client"

import ReactMarkdown from 'react-markdown'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Bot, User, Clock } from "lucide-react"
import type { Conversation, Message } from "./conversation-list"

interface ConversationDetailProps {
  conversation: Conversation | null
}

function formatTime(timestamp?: string) {
  if (!timestamp) return null
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isAI = message.type === "ai"
  const content = message.data?.content || '(empty message)'
  const time = formatTime(message.timestamp)

  return (
    <div
      className={cn(
        "flex gap-2 md:gap-3 animate-fade-in",
        isAI ? "flex-row" : "flex-row-reverse"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs",
          isAI ? "bg-foreground/10" : "bg-foreground/5"
        )}>
          {isAI ? <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <User className="h-3.5 w-3.5 md:h-4 md:w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[85%] md:max-w-[80%]", isAI ? "" : "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 md:px-4 md:py-3",
            isAI
              ? "bg-card border border-border rounded-tl-sm"
              : "bg-foreground/10 rounded-tr-sm"
          )}
        >
          <div className="prose-chat text-sm md:text-base">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        {time && (
          <p className={cn("text-[10px] text-muted-foreground mt-1 px-1", isAI ? "" : "text-right")}>
            {time}
          </p>
        )}
      </div>
    </div>
  )
}

export function ConversationDetail({ conversation }: ConversationDetailProps) {
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Choose a conversation from the list to view messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="font-medium text-sm">Session</h2>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {conversation.sessionId}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1 shrink-0">
            <p className="text-xs text-muted-foreground">
              {conversation.messages.length} messages
            </p>
            {conversation.createdAt && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">{new Date(conversation.createdAt).toLocaleString()}</span>
                <span className="sm:hidden">{new Date(conversation.createdAt).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {conversation.messages.map((message, index) => (
            <MessageBubble key={index} message={message} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
