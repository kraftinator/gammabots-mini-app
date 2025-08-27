import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header for Quick Auth token
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Validate that we have a token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Log the token for debugging (first 20 chars only)
    console.log('Bots API called with Quick Auth token:', token.slice(0, 20), '...')

    // Check if we have external API configuration
    const apiUrl = process.env.GAMMABOTS_API_URL
    const apiKey = process.env.GAMMABOTS_API_KEY

    if (apiUrl && apiKey) {
      // Production: Use external Gammabots API
      const url = `${apiUrl}/bots`
      
      console.log('Fetching bots from Gammabots API:', apiUrl)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass through the Quick Auth token
          'X-API-Key': apiKey // API key in header instead of query param
        },
      })

      if (!response.ok) {
        console.error('Gammabots API error:', response.status, response.statusText)
        return NextResponse.json(
          { error: 'Failed to fetch bots from Gammabots API' },
          { status: response.status }
        )
      }

      const botsData = await response.json()
      console.log('Bots data received from external API:', JSON.stringify(botsData, null, 2))
      return NextResponse.json(botsData)
    } else {
      // Development: Return mock data
      console.log('Using mock bots data (no external API configured)')
      
      const mockBots = [
        {
          id: 1,
          name: 'Bitcoin DCA Bot',
          status: 'active',
          performance: 12.5,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'ETH Swing Trader',
          status: 'paused',
          performance: -2.1,
          created_at: '2024-01-10T15:30:00Z'
        },
        {
          id: 3,
          name: 'Multi-Coin Arbitrage',
          status: 'active',
          performance: 8.7,
          created_at: '2024-01-05T09:15:00Z'
        }
      ]

      return NextResponse.json(mockBots)
    }
    
  } catch (error) {
    console.error('Error in bots API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
