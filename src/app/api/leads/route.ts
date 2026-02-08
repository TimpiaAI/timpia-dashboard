import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

interface Lead {
  clientId?: string
  nume_complet?: string
  firma?: string
  nr_locatii?: string
  email?: string
  telefon?: string
  telefon_whatsapp?: string
  functionalitati_dorite?: string
  alte_nevoi?: string | null
  photos?: string[]
}

interface LeadPayload {
  output?: Lead[]
  content?: string
  // Direct lead fields
  clientId?: string
  nume_complet?: string
  firma?: string
  nr_locatii?: string
  email?: string
  telefon?: string
  telefon_whatsapp?: string
  functionalitati_dorite?: string
  alte_nevoi?: string | null
  photos?: string[]
}

export async function POST(request: Request) {
  try {
    const body: LeadPayload = await request.json()

    // Extract leads from different payload formats
    let leads: Lead[] = []

    if (body.output && Array.isArray(body.output)) {
      // Format 1: { output: [{...}] }
      leads = body.output
    } else if (body.content) {
      // Format 2: { content: '{"output":[...]}' }
      try {
        const parsed = JSON.parse(body.content)
        if (parsed.output && Array.isArray(parsed.output)) {
          leads = parsed.output
        }
      } catch {
        // Content is not valid JSON, ignore
      }
    } else if (body.email || body.nume_complet || body.firma) {
      // Format 3: Direct lead object { clientId, nume_complet, firma, ... }
      leads = [{
        clientId: body.clientId,
        nume_complet: body.nume_complet,
        firma: body.firma,
        nr_locatii: body.nr_locatii,
        email: body.email,
        telefon: body.telefon,
        telefon_whatsapp: body.telefon_whatsapp,
        functionalitati_dorite: body.functionalitati_dorite,
        alte_nevoi: body.alte_nevoi,
        photos: body.photos
      }]
    }

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads provided in payload' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection('leads')

    // Add timestamps and store each lead
    const leadsToInsert = leads.map(lead => ({
      ...lead,
      createdAt: new Date(),
      source: 'api'
    }))

    const result = await collection.insertMany(leadsToInsert)

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${result.insertedCount} lead(s)`,
      insertedIds: result.insertedIds
    })
  } catch (error) {
    console.error('Error storing leads:', error)
    return NextResponse.json(
      { error: 'Failed to store leads' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve leads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const search = searchParams.get('search') || ''

    const db = await getDatabase()
    const collection = db.collection('leads')

    // Build query
    const query: Record<string, unknown> = {}
    if (search) {
      query['$or'] = [
        { email: { $regex: search, $options: 'i' } },
        { firma: { $regex: search, $options: 'i' } },
        { nume_complet: { $regex: search, $options: 'i' } },
        { telefon: { $regex: search, $options: 'i' } },
        { telefon_whatsapp: { $regex: search, $options: 'i' } }
      ]
    }

    // Get leads
    const leads = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await collection.countDocuments(query)

    return NextResponse.json({
      leads,
      total,
      hasMore: skip + leads.length < total
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
