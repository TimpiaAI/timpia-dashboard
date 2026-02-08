import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// GET - List all sessions
export async function GET() {
  try {
    const db = await getDatabase()
    const sessions = await db.collection('sessions').find().sort({ _id: -1 }).toArray()

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST - Create new session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const result = await db.collection('sessions').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// PUT - Update session
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { _id, ...updateData } = body
    const db = await getDatabase()

    const result = await db.collection('sessions').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

// DELETE - Delete session
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection('sessions').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
