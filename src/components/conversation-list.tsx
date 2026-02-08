"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { truncateText } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { MessageSquare, User } from "lucide-react"

export interface Message {
  type: "human" | "ai"
  data: {
    content: string
  }
  timestamp?: string
}

export interface Conversation {
  _id: string
  sessionId: string
  messages: Message[]
  createdAt?: string
  updatedAt?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1]
          const isSelected = selectedId === conversation._id

          return (
            <button
              key={conversation._id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all",
                isSelected
                  ? "bg-foreground/5 border border-foreground/10"
                  : "hover:bg-foreground/[0.02]"
              )}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-foreground/5 text-foreground/60">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                    {conversation.sessionId}
                  </p>
                </div>
                <p className="text-sm text-foreground/80 truncate mt-1">
                  {lastMessage?.data?.content
                    ? truncateText(lastMessage.data.content, 60)
                    : 'No messages'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {conversation.messages.length}
                  </span>
                  {conversation.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
        {conversations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
