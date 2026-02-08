import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()

    // Get stats from chat_marketmanager only
    const totalConversations = await db.collection('chat_marketmanager').countDocuments()

    // Calculate total messages
    const conversations = await db.collection('chat_marketmanager').find().toArray()
    const totalMessages = conversations.reduce((acc, doc) => {
      return acc + (doc.messages?.length || 0)
    }, 0)

    // Get unique sessions
    const uniqueSessions = await db.collection('chat_marketmanager').distinct('sessionId')

    // Count human and AI messages separately
    let humanMessages = 0
    let aiMessages = 0
    conversations.forEach(conv => {
      conv.messages?.forEach((msg: { type: string }) => {
        if (msg.type === 'human') humanMessages++
        else if (msg.type === 'ai') aiMessages++
      })
    })

    return NextResponse.json({
      totalConversations,
      totalMessages,
      humanMessages,
      aiMessages,
      uniqueSessions: uniqueSessions.length,
      avgMessagesPerSession: uniqueSessions.length > 0
        ? Math.round(totalMessages / uniqueSessions.length)
        : 0,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
