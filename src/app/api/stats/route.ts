import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()

    // Get stats from different collections
    const chatMarketManager = await db.collection('chat_marketmanager').countDocuments()
    const chatHistories = await db.collection('n8n_chat_historiese').countDocuments()
    const sessions = await db.collection('sessions').countDocuments()

    // Calculate total messages
    const marketManagerDocs = await db.collection('chat_marketmanager').find().toArray()
    const totalMessages = marketManagerDocs.reduce((acc, doc) => {
      return acc + (doc.messages?.length || 0)
    }, 0)

    // Get unique users (by sessionId)
    const uniqueSessions = await db.collection('chat_marketmanager').distinct('sessionId')

    // Get recent activity (last 7 days breakdown)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get all collections for total stats
    const collections = await db.listCollections().toArray()
    const conversationCollections = collections.filter(c =>
      c.name.includes('chat') || c.name.includes('histories')
    )

    let totalConversations = 0
    for (const coll of conversationCollections) {
      totalConversations += await db.collection(coll.name).countDocuments()
    }

    return NextResponse.json({
      totalConversations,
      totalMessages,
      uniqueUsers: uniqueSessions.length,
      activeSessions: sessions,
      collections: {
        chat_marketmanager: chatMarketManager,
        n8n_chat_historiese: chatHistories,
        sessions
      },
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
