import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// This endpoint is called by Vercel Cron
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()

    // Gather stats
    const totalConversations = await db.collection('chat_marketmanager').countDocuments()
    const conversations = await db.collection('chat_marketmanager').find().toArray()

    const totalMessages = conversations.reduce((acc, doc) => acc + (doc.messages?.length || 0), 0)
    const uniqueSessions = await db.collection('chat_marketmanager').distinct('sessionId')

    let humanMessages = 0
    let aiMessages = 0
    const allHumanMessages: string[] = []

    conversations.forEach(conv => {
      conv.messages?.forEach((msg: { type: string; data?: { content?: string } }) => {
        if (msg.type === 'human') {
          humanMessages++
          if (msg.data?.content) {
            allHumanMessages.push(msg.data.content)
          }
        } else if (msg.type === 'ai') {
          aiMessages++
        }
      })
    })

    const stats = {
      totalConversations,
      totalMessages,
      humanMessages,
      aiMessages,
      uniqueSessions: uniqueSessions.length,
      avgMessagesPerSession: uniqueSessions.length > 0
        ? Math.round(totalMessages / uniqueSessions.length)
        : 0
    }

    // Generate AI insights
    let insights = null

    if (allHumanMessages.length > 0 && process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })

      const sampleMessages = allHumanMessages.slice(0, 100).join('\n---\n')

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze these user messages from a chatbot and provide insights in JSON format:

${sampleMessages}

Return ONLY a JSON object with:
{
  "topQuestions": ["top 5 most common question types"],
  "commonTopics": ["list of common topics/themes"],
  "sentiment": "overall sentiment (positive/neutral/negative)",
  "summary": "2-3 sentence summary of what users are asking about",
  "recommendation": "1 actionable recommendation for improving the chatbot"
}`
        }]
      })

      try {
        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0])
        }
      } catch {
        console.error('Failed to parse AI response')
      }
    }

    // Save to analytics_cache collection
    await db.collection('analytics_cache').updateOne(
      { type: 'weekly_insights' },
      {
        $set: {
          type: 'weekly_insights',
          stats,
          insights,
          generatedAt: new Date().toISOString(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Analytics cached successfully',
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron analytics error:', error)
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 })
  }
}
