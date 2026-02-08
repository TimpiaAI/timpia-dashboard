"use client"

import ReactMarkdown from 'react-markdown'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import type { Conversation, Message } from "./conversation-list"

interface ConversationDetailProps {
  conversation: Conversation | null
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isAI = message.type === "ai"
  const content = message.data?.content || '(empty message)'

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isAI ? "flex-row" : "flex-row-reverse"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs",
          isAI ? "bg-foreground/10" : "bg-foreground/5"
        )}>
          {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isAI
            ? "bg-card border border-border rounded-tl-sm"
            : "bg-foreground/10 rounded-tr-sm"
        )}
      >
        <div className="prose-chat">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
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
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-sm">Session</h2>
              <p className="text-xs text-muted-foreground font-mono">
                {conversation.sessionId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {conversation.messages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <MessageBubble key={index} message={message} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
