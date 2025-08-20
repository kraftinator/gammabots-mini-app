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
    const url = `${apiUrl}/dashboard_metrics?apikey=${apiKey}`
    
    console.log('Fetching from Gammabots Dashboard API:', apiUrl)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Gammabots Dashboard API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics from Gammabots API' },
        { status: response.status }
      )
    }

    const dashboardData = await response.json()
    
    // Return the dashboard data directly (no transformation needed)
    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
