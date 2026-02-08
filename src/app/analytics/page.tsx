"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Sparkles, MessageSquare, TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts"

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

interface ChartData {
  messageTypeData: { name: string; value: number; fill: string }[]
  recentConversations: { name: string; messages: number }[]
  activityData: { date: string; conversations: number; messages: number }[]
  totals: {
    conversations: number
    humanMessages: number
    aiMessages: number
    totalMessages: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Insights | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [insightsRes, chartRes] = await Promise.all([
        fetch('/api/insights'),
        fetch('/api/chart-data')
      ])

      if (insightsRes.ok) {
        const result = await insightsRes.json()
        setData(result)
      }

      if (chartRes.ok) {
        const charts = await chartRes.json()
        setChartData(charts)
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 animate-pulse text-foreground/40" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
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
          <Button variant="ghost" size="sm" onClick={fetchData} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights and charts
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
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

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6 md:mb-8">
        {/* Message Type Distribution (Pie Chart) */}
        <Card className="border-foreground/5">
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Message Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData?.messageTypeData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData?.messageTypeData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
                <span className="text-xs text-muted-foreground">User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-muted-foreground">AI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages per Conversation (Bar Chart) */}
        <Card className="border-foreground/5">
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Messages per Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.recentConversations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#888', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                  />
                  <YAxis
                    tick={{ fill: '#888', fontSize: 10 }}
                    axisLine={{ stroke: '#333' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Over Time (Line Chart) */}
      <Card className="border-foreground/5 mb-6 md:mb-8">
        <CardHeader className="pb-3 p-4 md:p-6">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Activity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData?.activityData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversations"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* AI Summary */}
        <Card className="border-foreground/5">
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <p className="text-sm text-foreground/80 leading-relaxed">
              {data?.insights?.summary || 'No summary available. Run the analytics cron job to generate AI insights.'}
            </p>
            {data?.insights?.recommendation && (
              <div className="mt-4 p-3 rounded-lg bg-foreground/[0.02] border border-foreground/5">
                <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                <p className="text-sm">{data.insights.recommendation}</p>
              </div>
            )}
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
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Top Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="space-y-2">
              {data?.insights?.topQuestions?.map((question, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-foreground/[0.02]">
                  <span className="text-xs text-muted-foreground tabular-nums w-4 shrink-0">{i + 1}.</span>
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
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Common Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
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
          Last updated: {new Date(data.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
