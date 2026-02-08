import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

/**
 * Parses a duration string (e.g., "1 minut 12 secunde") into total seconds.
 */
function parseDuration(durationStr: string | number | undefined | null): number | null {
  if (typeof durationStr === 'number') {
    return durationStr
  }
  if (!durationStr || typeof durationStr !== 'string') {
    return null
  }

  let totalSeconds = 0
  const minuteMatch = durationStr.match(/(\d+)\s*(minut|minute)/i)
  if (minuteMatch) {
    totalSeconds += parseInt(minuteMatch[1], 10) * 60
  }

  const secondMatch = durationStr.match(/(\d+)\s*(secund[aăe]|sec)/i)
  if (secondMatch) {
    totalSeconds += parseInt(secondMatch[1], 10)
  }

  if (totalSeconds === 0 && /^\d+$/.test(durationStr)) {
    return parseInt(durationStr, 10)
  }

  return totalSeconds > 0 ? totalSeconds : null
}

/**
 * Formats the recording URL. If it's a base64 string, it creates a Data URI.
 */
function formatRecordingUrl(url: string | undefined | null): string | null {
  if (!url) return null
  if (!url.startsWith('http') && url.length > 200) {
    return `data:audio/mpeg;base64,${url}`
  }
  return url
}

export async function POST(request: NextRequest) {
  // Authentication via Bearer token
  const authorizationHeader = request.headers.get('Authorization')
  const expectedToken = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`

  if (!authorizationHeader || authorizationHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing token.' }, { status: 401 })
  }

  try {
    const data = await request.json()
    console.log('[INGEST-DATA] Received payload:', JSON.stringify(data, null, 2))

    const { clientId } = data

    if (!clientId) {
      console.error('[INGEST-DATA] Error: clientId is missing from payload.')
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 })
    }

    const db = await getDatabase()
    const timestamp = new Date()

    // --- Update or Create Client Stats ---
    if (data.stats && typeof data.stats === 'object') {
      const statsUpdate: Record<string, any> = {
        updatedAt: timestamp
      }

      if (data.stats.totalCalls) {
        statsUpdate.$inc = { ...statsUpdate.$inc, 'stats.totalCalls': Number(data.stats.totalCalls) }
      }
      if (data.stats.totalMessages) {
        statsUpdate.$inc = { ...statsUpdate.$inc, 'stats.totalMessages': Number(data.stats.totalMessages) }
      }
      if (data.stats.totalSms) {
        statsUpdate.$inc = { ...statsUpdate.$inc, 'stats.totalSms': Number(data.stats.totalSms) }
      }
      if (data.stats.avgDuration) {
        statsUpdate.$set = { ...statsUpdate.$set, 'stats.avgDuration': Number(data.stats.avgDuration) }
      }
      if (data.stats.lastSmsMessage?.trim()) {
        statsUpdate.$set = { ...statsUpdate.$set, 'stats.lastSmsMessage': data.stats.lastSmsMessage }
      }
      if (data.stats.lastSmsPhoneNumber?.trim()) {
        statsUpdate.$set = { ...statsUpdate.$set, 'stats.lastSmsPhoneNumber': data.stats.lastSmsPhoneNumber }
      }
      if (data.stats.status) {
        statsUpdate.$set = { ...statsUpdate.$set, 'stats.status': data.stats.status }
      }

      await db.collection('client_dashboard').updateOne(
        { clientId },
        {
          $set: { clientId, clientName: clientId, updatedAt: timestamp },
          $setOnInsert: { createdAt: timestamp },
          ...statsUpdate
        },
        { upsert: true }
      )
      console.log('[INGEST-DATA] Stats updated for client:', clientId)
    }

    // --- Log Call Transcripts ---
    const isCallData = !!data.call_id
    if (isCallData) {
      console.log(`[INGEST-DATA] Logging call transcript for client '${clientId}'.`)
      await db.collection('call_transcripts').insertOne({
        clientId,
        call_id: data.call_id,
        timestamp,
        transcript: data.transcript || null,
        duration: parseDuration(data.duration),
        outcome: data.outcome || 'N/A',
        recordingUrl: formatRecordingUrl(data.recording_url),
        summary: data.call_summary || null,
        caller_phone_number: data.caller_phone_number || null,
      })
    }

    // --- Log Chat Messages ---
    const isChatData = !!data.messageContent?.trim()
    if (isChatData) {
      console.log(`[INGEST-DATA] Logging chat message for client '${clientId}'.`)
      await db.collection('chat_messages').insertOne({
        clientId,
        timestamp,
        message: data.messageContent,
        country: data.country || null,
        platform: data.platform || null,
        sessionId: data.sessionId || null,
      })
    }

    // --- Log SMS Messages ---
    const isSmsData = !!data.sms_message?.trim() && !!data.sms_phone_number?.trim()
    if (isSmsData) {
      console.log(`[INGEST-DATA] Logging SMS for client '${clientId}'.`)
      await db.collection('sms_logs').insertOne({
        clientId,
        timestamp,
        message: data.sms_message,
        phoneNumber: data.sms_phone_number,
      })
    }

    // --- Dynamic Lead Data Logging ---
    const nonLeadKeys = new Set([
      'clientId', 'stats', 'call_id', 'transcript', 'duration', 'outcome',
      'recording_url', 'call_summary', 'caller_phone_number', 'messageContent',
      'country', 'sessionId', 'platform', 'sms_message', 'sms_phone_number'
    ])

    const leadData: Record<string, any> = {}
    for (const key in data) {
      if (!nonLeadKeys.has(key)) {
        leadData[key] = data[key]
      }
    }

    if (Object.keys(leadData).length > 0) {
      console.log(`[INGEST-DATA] Saving lead data for client '${clientId}'.`, leadData)

      // Normalize 'services' to array if string
      if (leadData.services && typeof leadData.services === 'string') {
        leadData.services = leadData.services.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      }

      await db.collection('leads').insertOne({
        clientId,
        timestamp,
        ...leadData,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Data ingested successfully for client: ${clientId}`
    })

  } catch (error: any) {
    console.error('[INGEST-DATA] Critical Error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
