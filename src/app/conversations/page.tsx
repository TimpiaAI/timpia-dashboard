"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConversationList, Conversation } from "@/components/conversation-list"
import { ConversationDetail } from "@/components/conversation-detail"

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [collection, setCollection] = useState("chat_marketmanager")

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        collection,
        limit: '100',
        ...(search && { search })
      })
      const res = await fetch(`/api/conversations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [collection])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchConversations()
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Conversation List */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-background">
        <div className="p-4 border-b border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium">Conversations</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchConversations}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Collection Selector */}
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="flex-1 rounded-lg border border-border/50 bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-foreground/20"
            >
              <option value="chat_marketmanager">chat_marketmanager</option>
              <option value="n8n_chat_historiese">n8n_chat_historiese</option>
            </select>
          </div>

          {/* Search by Session ID */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by session ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-transparent pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </form>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse-slow text-muted-foreground text-sm">
              Loading...
            </div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?._id}
            onSelect={setSelectedConversation}
          />
        )}

        {/* Count */}
        {!loading && (
          <div className="p-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {conversations.length} conversations
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Conversation Detail */}
      <div className="flex-1 bg-card/50">
        <ConversationDetail conversation={selectedConversation} />
      </div>
    </div>
  )
}
