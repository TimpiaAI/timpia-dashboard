"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatRelativeTime, truncateText } from "@/lib/utils"
import { cn } from "@/lib/utils"

export interface Message {
  type: "human" | "ai"
  data: {
    content: string
  }
}

export interface Conversation {
  _id: string
  sessionId: string
  messages: Message[]
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
          const phoneNumber = conversation.sessionId.replace(/[^0-9]/g, '').slice(-10)

          return (
            <button
              key={conversation._id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors",
                isSelected
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {phoneNumber.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    +{phoneNumber.slice(0, 2)} {phoneNumber.slice(2, 5)} {phoneNumber.slice(5)}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {conversation.updatedAt ? formatRelativeTime(conversation.updatedAt) : ''}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {lastMessage?.data?.content
                    ? truncateText(lastMessage.data.content, 50)
                    : 'No messages'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                    {conversation.messages.length} msgs
                  </span>
                </div>
              </div>
            </button>
          )
        })}
        {conversations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
