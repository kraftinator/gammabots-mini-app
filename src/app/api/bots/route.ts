import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  console.log('Bots API called with authenticated token:', auth.token.slice(0, 20), '...')

  // Construct the URL
  const url = `${auth.apiUrl}/bots`
  
  try {
    const response = await callExternalAPI(url, auth)

    if (!response.ok) {
      console.error('Gammabots API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch bots from Gammabots API' },
        { status: response.status }
      )
    }

    const botsData = await response.json()
    console.log('✅ Bots data received and returned successfully')
    return NextResponse.json(botsData)
    
  } catch (error) {
    console.error('Error in bots API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})