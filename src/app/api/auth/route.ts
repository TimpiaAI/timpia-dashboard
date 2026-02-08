import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { key } = await request.json()
    const validKey = process.env.DASHBOARD_AUTH_KEY

    if (!validKey) {
      console.error('DASHBOARD_AUTH_KEY not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Constant-time comparison to prevent timing attacks
    const keyBuffer = Buffer.from(key || '')
    const validBuffer = Buffer.from(validKey)

    if (keyBuffer.length !== validBuffer.length || !crypto.timingSafeEqual(keyBuffer, validBuffer)) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    // Store valid session (in production, use Redis or DB)
    cookieStore.set('session_valid', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  cookieStore.delete('session_valid')
  return NextResponse.json({ success: true })
}
