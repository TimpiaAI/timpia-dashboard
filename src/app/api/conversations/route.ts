import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collection = searchParams.get('collection') || 'chat_marketmanager'
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const search = searchParams.get('search') || ''

    const db = await getDatabase()
    const coll = db.collection(collection)

    // Build query
    const query: Record<string, unknown> = {}
    if (search) {
      query['sessionId'] = { $regex: search, $options: 'i' }
    }

    // Get conversations
    const conversations = await coll
      .find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await coll.countDocuments(query)

    return NextResponse.json({
      conversations,
      total,
      hasMore: skip + conversations.length < total
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
