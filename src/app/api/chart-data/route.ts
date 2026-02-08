import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()
    const conversations = await db.collection('chat_marketmanager').find().toArray()

    // Message type distribution (human vs AI)
    let humanMessages = 0
    let aiMessages = 0

    // Messages per conversation
    const messagesPerConversation: { name: string; messages: number }[] = []

    // Daily activity (group by date)
    const dailyActivity: Record<string, { date: string; conversations: number; messages: number }> = {}

    conversations.forEach((conv, index) => {
      const msgCount = conv.messages?.length || 0
      messagesPerConversation.push({
        name: `Conv ${index + 1}`,
        messages: msgCount
      })

      // Get date from updatedAt or createdAt
      const date = conv.updatedAt || conv.createdAt
      if (date) {
        const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (!dailyActivity[dateStr]) {
          dailyActivity[dateStr] = { date: dateStr, conversations: 0, messages: 0 }
        }
        dailyActivity[dateStr].conversations++
        dailyActivity[dateStr].messages += msgCount
      }

      conv.messages?.forEach((msg: { type: string }) => {
        if (msg.type === 'human') humanMessages++
        else if (msg.type === 'ai') aiMessages++
      })
    })

    // Message type pie chart data
    const messageTypeData = [
      { name: 'User Messages', value: humanMessages, fill: '#6366f1' },
      { name: 'AI Responses', value: aiMessages, fill: '#22c55e' }
    ]

    // Get last 10 conversations for bar chart
    const recentConversations = messagesPerConversation.slice(-10)

    // Sort daily activity by date and get last 7 days
    const activityData = Object.values(dailyActivity)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)

    return NextResponse.json({
      messageTypeData,
      recentConversations,
      activityData,
      totals: {
        conversations: conversations.length,
        humanMessages,
        aiMessages,
        totalMessages: humanMessages + aiMessages
      }
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
