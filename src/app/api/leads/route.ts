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
    } else if (body.contact_name || body.contact_email || body.issue_summary) {
      // Format: create_handoff_ticket (support ticket)
      leads = [{
        type: 'ticket',
        nume_complet: body.contact_name,
        email: body.contact_email,
        telefon: body.contact_phone,
        issue_summary: body.issue_summary,
        category: body.category
      }]
    } else if (body.full_name || body.company || body.desired_features) {
      // Format: submit_lead_data (English fields)
      leads = [{
        type: 'lead',
        nume_complet: body.full_name,
        firma: body.company,
        nr_locatii: body.locations?.toString(),
        email: body.email,
        telefon: body.phone,
        functionalitati_dorite: body.desired_features,
        alte_nevoi: body.other_needs,
        trial_interest: body.trial_interest,
        consent_forward: body.consent_forward
      }]
    } else if (body.email || body.nume_complet || body.firma) {
      // Format: Direct Romanian fields { clientId, nume_complet, firma, ... }
      leads = [{
        type: 'lead',
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
