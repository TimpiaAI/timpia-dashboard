import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()

    // Try to get cached analytics first
    const cached = await db.collection('analytics_cache').findOne({ type: 'weekly_insights' })

    if (cached) {
      return NextResponse.json({
        stats: cached.stats,
        insights: cached.insights,
        generatedAt: cached.generatedAt,
        cached: true
      })
    }

    // Fallback: generate basic stats without AI (AI runs via cron)
    const totalConversations = await db.collection('chat_marketmanager').countDocuments()
    const conversations = await db.collection('chat_marketmanager').find().toArray()

    const totalMessages = conversations.reduce((acc, doc) => acc + (doc.messages?.length || 0), 0)
    const uniqueSessions = await db.collection('chat_marketmanager').distinct('sessionId')

    let humanMessages = 0
    conversations.forEach(conv => {
      conv.messages?.forEach((msg: { type: string }) => {
        if (msg.type === 'human') humanMessages++
      })
    })

    return NextResponse.json({
      stats: {
        totalConversations,
        totalMessages,
        uniqueSessions: uniqueSessions.length,
        humanMessages
      },
      insights: null,
      generatedAt: new Date().toISOString(),
      cached: false,
      message: 'No cached analytics available. Run the cron job to generate AI insights.'
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}
