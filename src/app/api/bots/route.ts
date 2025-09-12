import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  console.log('Bots API called with authenticated token:', auth.token.slice(0, 20), '...')

  // Extract query parameters
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'active'

  // Construct the URL with status parameter
  const url = new URL(`${auth.apiUrl}/bots`)
  url.searchParams.append('status', status)
  
  try {
    const response = await callExternalAPI(url.toString(), auth)

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

export const POST = withAuth(async (request: NextRequest, auth) => {
  console.log('Create Bot API called with authenticated token:', auth.token.slice(0, 20), '...')

  try {
    const body = await request.json()
    const url = `${auth.apiUrl}/bots`
    
    const response = await callExternalAPI(url, auth, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('Gammabots Create Bot API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to create bot' },
        { status: response.status }
      )
    }

    const botData = await response.json()
    console.log('✅ Bot created successfully')
    return NextResponse.json(botData)
    
  } catch (error) {
    console.error('Error creating bot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})