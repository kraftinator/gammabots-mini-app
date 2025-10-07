import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  console.log('Strategies API called with authenticated token:', auth.token.slice(0, 20), '...')

  // Construct the URL
  const url = `${auth.apiUrl}/strategies`
  
  try {
    const response = await callExternalAPI(url, auth)

    if (!response.ok) {
      console.error('Gammabots API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch strategies from Gammabots API' },
        { status: response.status }
      )
    }

    const strategiesData = await response.json()
    console.log('✅ Strategies data received and returned successfully')
    return NextResponse.json(strategiesData)
    
  } catch (error) {
    console.error('Error in strategies API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: NextRequest, auth) => {
  console.log('Create Strategy API called with authenticated token:', auth.token.slice(0, 20), '...')

  try {
    const body = await request.json()
    console.log('Request body received:', body)
    console.log('Sending to backend:', JSON.stringify(body))
    const url = `${auth.apiUrl}/strategies`
    
    const response = await callExternalAPI(url, auth, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('Gammabots Create Strategy API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to create strategy' },
        { status: response.status }
      )
    }

    const strategyData = await response.json()
    console.log('✅ Strategy created successfully')
    return NextResponse.json(strategyData)
    
  } catch (error) {
    console.error('Error creating strategy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})