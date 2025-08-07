import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.GAMMABOTS_API_URL
    const apiKey = process.env.GAMMABOTS_API_KEY

    if (!apiUrl || !apiKey) {
      console.error('Missing Gammabots API configuration')
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    // Construct the URL with API key as query parameter
    const url = `${apiUrl}/bots?apikey=${apiKey}`
    
    console.log('Fetching from Gammabots API:', apiUrl)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Gammabots API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch bots from Gammabots API' },
        { status: response.status }
      )
    }

    const bots = await response.json()
    
    // Transform the data for our Mini App
    const transformedBots = {
      active_count: bots.length,
      bots: bots.map((bot: any) => ({
        id: bot.bot_id,
        token: bot.token_symbol,
        strategy: bot.strategy_id
      }))
    }

    return NextResponse.json(transformedBots)
    
  } catch (error) {
    console.error('Error fetching bots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
