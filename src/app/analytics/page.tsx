"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Sparkles, MessageSquare, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Insights {
  stats: {
    totalConversations: number
    totalMessages: number
    uniqueSessions: number
    humanMessages: number
  }
  insights: {
    topQuestions: string[]
    commonTopics: string[]
    sentiment: string
    summary: string
    recommendation: string
  } | null
  generatedAt: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insights')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        setError('Failed to load insights')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 animate-pulse text-foreground/40" />
          <p className="text-sm text-muted-foreground">Analyzing conversations with AI...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive/60" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchInsights} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights from your conversations
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-foreground/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Conversations</p>
            <p className="text-2xl font-semibold tabular-nums">{data?.stats.totalConversations || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-foreground/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-semibold tabular-nums">{data?.stats.totalMessages || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-foreground/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">User Messages</p>
            <p className="text-2xl font-semibold tabular-nums">{data?.stats.humanMessages || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-foreground/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Unique Sessions</p>
            <p className="text-2xl font-semibold tabular-nums">{data?.stats.uniqueSessions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Summary */}
        <Card className="border-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {data?.insights?.summary || 'No summary available'}
            </p>
            <div className="mt-4 p-3 rounded-lg bg-foreground/[0.02] border border-foreground/5">
              <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
              <p className="text-sm">
                {data?.insights?.recommendation || 'No recommendations yet'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sentiment:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                data?.insights?.sentiment === 'positive' ? 'bg-green-500/10 text-green-500' :
                data?.insights?.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                'bg-foreground/5 text-foreground/60'
              }`}>
                {data?.insights?.sentiment || 'neutral'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card className="border-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Top Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.insights?.topQuestions?.map((question, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-foreground/[0.02]">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{i + 1}.</span>
                  <p className="text-sm flex-1">{question}</p>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No questions analyzed yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Common Topics */}
        <Card className="border-foreground/5 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Common Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data?.insights?.commonTopics?.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-foreground/5 text-sm"
                >
                  {topic}
                </span>
              )) || (
                <p className="text-sm text-muted-foreground">No topics identified yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data?.generatedAt && (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Generated at {new Date(data.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
