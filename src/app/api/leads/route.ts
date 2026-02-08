import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getResend, EMAIL_FROM, generateLeadNotificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const NOTIFICATION_EMAILS = ['info@marketmanager.ro', 'ovidiu@timpia.ai']

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
  // Additional fields
  type?: 'lead' | 'ticket'
  trial_interest?: boolean
  consent_forward?: boolean
  issue_summary?: string
  category?: string
}

interface LeadPayload {
  output?: Lead[]
  content?: string
  // Format 1: Direct Romanian fields
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
  // Format 2: submit_lead_data (English)
  full_name?: string
  company?: string
  locations?: number | string
  phone?: string
  desired_features?: string
  other_needs?: string
  trial_interest?: boolean
  consent_forward?: boolean
  // Format 3: create_handoff_ticket
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  issue_summary?: string
  category?: string
}

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await request.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let leads: any[] = []

    if (body.output && Array.isArray(body.output)) {
      // Format 1: { output: [{...}] }
      leads = body.output
    } else if (body.content && typeof body.content === 'string') {
      // Format 2: { content: '{"output":[...]}' }
      try {
        const parsed = JSON.parse(body.content)
        if (parsed.output && Array.isArray(parsed.output)) {
          leads = parsed.output
        } else {
          // Content is JSON but not output array - store as single lead
          leads = [parsed]
        }
      } catch {
        // Content is not valid JSON, ignore
      }
    }

    // If no leads extracted yet, normalize known fields and store the whole body
    if (leads.length === 0) {
      // Normalize common field variations to standard names
      const normalized = { ...body }

      // English -> Romanian field mapping
      if (body.full_name && !body.nume_complet) normalized.nume_complet = body.full_name
      if (body.company && !body.firma) normalized.firma = body.company
      if (body.locations && !body.nr_locatii) normalized.nr_locatii = String(body.locations)
      if (body.phone && !body.telefon) normalized.telefon = body.phone
      if (body.desired_features && !body.functionalitati_dorite) normalized.functionalitati_dorite = body.desired_features
      if (body.other_needs && !body.alte_nevoi) normalized.alte_nevoi = body.other_needs

      // Ticket field mapping
      if (body.contact_name && !body.nume_complet) normalized.nume_complet = body.contact_name
      if (body.contact_email && !body.email) normalized.email = body.contact_email
      if (body.contact_phone && !body.telefon) normalized.telefon = body.contact_phone

      // Auto-detect type
      if (body.issue_summary || body.category === 'bug' || body.category === 'support') {
        normalized.type = 'ticket'
      } else if (!normalized.type) {
        normalized.type = 'lead'
      }

      leads = [normalized]
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

    // Send email notification for each lead
    let emailsSent = 0
    if (process.env.RESEND_API_KEY) {
      const resend = getResend()

      for (const lead of leads) {
        try {
          const emailContent = generateLeadNotificationEmail(lead)
          await resend.emails.send({
            from: EMAIL_FROM,
            to: NOTIFICATION_EMAILS,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          })
          emailsSent++
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${result.insertedCount} lead(s)`,
      insertedIds: result.insertedIds,
      emailsSent
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
