"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare, Users, Activity, Bot, User, ArrowRight } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { truncateText } from "@/lib/utils"

interface Stats {
  totalConversations: number
  totalMessages: number
  humanMessages: number
  aiMessages: number
  uniqueSessions: number
  avgMessagesPerSession: number
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
          fetch('/api/conversations?collection=chat_marketmanager&limit=8')
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
        <div className="animate-pulse-slow text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chatbot activity overview
        </p>
      </div>

      {/* Stats Grid - 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        <StatsCard
          title="Conversations"
          value={stats?.totalConversations || 0}
          icon={MessageSquare}
        />
        <StatsCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={Activity}
        />
        <StatsCard
          title="User Messages"
          value={stats?.humanMessages || 0}
          icon={Users}
        />
        <StatsCard
          title="AI Responses"
          value={stats?.aiMessages || 0}
          icon={Bot}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6 md:mb-8">
        <Card className="border-foreground/5">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unique Sessions</p>
                <p className="text-2xl font-semibold tabular-nums">{stats?.uniqueSessions || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Messages/Session</p>
                <p className="text-2xl font-semibold tabular-nums">{stats?.avgMessagesPerSession || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
          <CardTitle className="text-base font-medium">
            Recent Conversations
          </CardTitle>
          <Link href="/conversations">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {recentConversations.map((conv) => {
                const lastMessage = conv.messages[conv.messages.length - 1]

                return (
                  <div
                    key={conv._id}
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-foreground/[0.02]"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-foreground/5 text-foreground/60">
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {conv.sessionId}
                      </p>
                      <p className="text-sm text-foreground/80 truncate mt-1">
                        {lastMessage?.data?.content
                          ? truncateText(lastMessage.data.content, 80)
                          : 'No messages'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.messages.length} messages
                      </p>
                    </div>
                  </div>
                )
              })}
              {recentConversations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
