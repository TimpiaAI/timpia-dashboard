"use client"

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

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isAI ? "flex-row" : "flex-row-reverse"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isAI ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isAI
            ? "bg-card border border-border rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.data?.content || '(empty message)'}
        </p>
      </div>
    </div>
  )
}

export function ConversationDetail({ conversation }: ConversationDetailProps) {
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a conversation from the list to view messages</p>
        </div>
      </div>
    )
  }

  const phoneNumber = conversation.sessionId.replace(/[^0-9]/g, '').slice(-10)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              {phoneNumber.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">
              +{phoneNumber.slice(0, 2)} {phoneNumber.slice(2, 5)} {phoneNumber.slice(5)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.messages.length} messages in this conversation
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
