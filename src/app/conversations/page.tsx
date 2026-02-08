"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConversationList, Conversation } from "@/components/conversation-list"
import { ConversationDetail } from "@/components/conversation-detail"

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        collection: 'chat_marketmanager',
        limit: '100',
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
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
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchConversations()
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowDetail(true)
  }

  const handleBackToList = () => {
    setShowDetail(false)
  }

  const clearFilters = () => {
    setSearch("")
    setDateFrom("")
    setDateTo("")
    setTimeout(fetchConversations, 0)
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Conversation List */}
      <div className={`w-full md:w-80 border-r border-border/50 flex flex-col bg-background ${showDetail ? 'hidden md:flex' : 'flex'}`}>
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

          {/* Search by Session ID */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by session ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-transparent pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>

            {/* Date Filters */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Calendar className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-transparent pl-7 pr-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  title="From date"
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-transparent pl-7 pr-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  title="To date"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 h-7 text-xs">
                Filter
              </Button>
              {(search || dateFrom || dateTo) && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
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
            onSelect={handleSelectConversation}
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
      <div className={`flex-1 bg-card/50 ${!showDetail ? 'hidden md:block' : 'block'}`}>
        {/* Mobile back button */}
        {showDetail && selectedConversation && (
          <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-3">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to list
            </button>
          </div>
        )}
        <ConversationDetail conversation={selectedConversation} />
      </div>
    </div>
  )
}
