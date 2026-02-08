"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
      <div className="w-96 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Conversations</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchConversations}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Collection Selector */}
          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="chat_marketmanager">chat_marketmanager</option>
            <option value="n8n_chat_historiese">n8n_chat_historiese</option>
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse-slow text-muted-foreground">
              Loading conversations...
            </div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?._id}
            onSelect={setSelectedConversation}
          />
        )}
      </div>

      {/* Right Panel - Conversation Detail */}
      <Card className="flex-1 rounded-none border-0">
        <ConversationDetail conversation={selectedConversation} />
      </Card>
    </div>
  )
}
