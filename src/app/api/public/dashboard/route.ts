import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.GAMMABOTS_API_URL
  const apiKey = process.env.GAMMABOTS_API_KEY

  if (!apiUrl || !apiKey) {
    console.error('Missing Gammabots API configuration')
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${apiUrl}/public/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    })

    if (!response.ok) {
      console.error('Gammabots Dashboard API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics' },
        { status: response.status }
      )
    }

    const dashboardData = await response.json()
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching public dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
