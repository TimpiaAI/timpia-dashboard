import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET() {
  try {
    const db = await getDatabase()

    // Get all conversations for analysis
    const conversations = await db.collection('chat_marketmanager').find().toArray()

    // Extract all human messages
    const humanMessages: string[] = []
    conversations.forEach(conv => {
      conv.messages?.forEach((msg: { type: string; data: { content: string } }) => {
        if (msg.type === 'human' && msg.data?.content) {
          humanMessages.push(msg.data.content)
        }
      })
    })

    // Get basic stats
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0)
    const uniqueSessions = [...new Set(conversations.map(c => c.sessionId))].length

    // Use AI to analyze the messages
    const sampleMessages = humanMessages.slice(0, 50).join('\n- ')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze these chatbot user messages and provide insights in JSON format:

Messages:
- ${sampleMessages}

Return ONLY valid JSON with this structure:
{
  "topQuestions": ["question1", "question2", "question3", "question4", "question5"],
  "commonTopics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive" | "neutral" | "negative",
  "summary": "Brief 2-sentence summary of what users are asking about",
  "recommendation": "One actionable recommendation to improve the chatbot"
}`
        }
      ]
    })

    const aiContent = message.content[0]
    let insights = null

    if (aiContent.type === 'text') {
      try {
        insights = JSON.parse(aiContent.text)
      } catch {
        insights = {
          topQuestions: ['Unable to parse'],
          commonTopics: ['Chat', 'Support', 'Questions'],
          sentiment: 'neutral',
          summary: aiContent.text.slice(0, 200),
          recommendation: 'Continue monitoring conversations'
        }
      }
    }

    return NextResponse.json({
      stats: {
        totalConversations,
        totalMessages,
        uniqueSessions,
        humanMessages: humanMessages.length
      },
      insights,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
