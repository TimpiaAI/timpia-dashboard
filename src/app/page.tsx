"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Users, TrendingUp, Activity } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Stats {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  activeSessions: number
  collections: {
    chat_marketmanager: number
    n8n_chat_historiese: number
    sessions: number
  }
}

interface Conversation {
  _id: string
  sessionId: string
  messages: { type: string; data: { content: string } }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, convRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/conversations?limit=5')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (convRes.ok) {
          const convData = await convRes.json()
          setRecentConversations(convData.conversations || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-slow text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your chatbot activity and conversations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Conversations"
          value={stats?.totalConversations || 0}
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
          description="from last week"
        />
        <StatsCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={Activity}
          trend={{ value: 8, isPositive: true }}
          description="from last week"
        />
        <StatsCard
          title="Unique Users"
          value={stats?.uniqueUsers || 0}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          description="from last week"
        />
        <StatsCard
          title="Active Sessions"
          value={stats?.activeSessions || 0}
          icon={TrendingUp}
          description="currently active"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentConversations.map((conv) => {
                  const phoneNumber = conv.sessionId.replace(/[^0-9]/g, '').slice(-10)
                  const lastMessage = conv.messages[conv.messages.length - 1]

                  return (
                    <div
                      key={conv._id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {phoneNumber.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          +{phoneNumber.slice(0, 2)} {phoneNumber.slice(2, 5)} ***
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lastMessage?.data?.content?.slice(0, 60) || 'No messages'}...
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conv.messages.length} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {recentConversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No conversations yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Collections Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Collections Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">chat_marketmanager</p>
                  <p className="text-xs text-muted-foreground">Main chat collection</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats?.collections?.chat_marketmanager || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">n8n_chat_historiese</p>
                  <p className="text-xs text-muted-foreground">N8N chat histories</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats?.collections?.n8n_chat_historiese || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">sessions</p>
                  <p className="text-xs text-muted-foreground">Active sessions</p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {stats?.collections?.sessions || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
