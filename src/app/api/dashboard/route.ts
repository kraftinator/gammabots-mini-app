import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header for Quick Auth token
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🚨 Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Validate that we have a token
    if (!token || token.length < 10) {
      console.log('🚨 Invalid token length')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if we have external API configuration
    const apiUrl = process.env.GAMMABOTS_API_URL
    const apiKey = process.env.GAMMABOTS_API_KEY

    if (!apiUrl || !apiKey) {
      console.log('🚨 Missing Gammabots API configuration')
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      )
    }

    // Construct the URL (no query parameter needed)
    const url = `${apiUrl}/dashboard_metrics`
    console.log('🔍 Full URL:', url)
    
    console.log('🔍 Making request to Gammabots API...')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Pass through the Quick Auth token
        'X-API-Key': apiKey // API key in header instead of query param
      },
    })
    
    console.log('🔍 Response status:', response.status)
    console.log('🔍 Response ok:', response.ok)

    if (!response.ok) {
      console.log('🚨 API request failed')
      console.error('Gammabots Dashboard API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics from Gammabots API' },
        { status: response.status }
      )
    }

    console.log('✅ API request successful, parsing response...')
    const dashboardData = await response.json()
    console.log('✅ Dashboard data received from external API:', JSON.stringify(dashboardData, null, 2))
    console.log('✅ Returning dashboard data to frontend')
    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.log('🚨 Exception in dashboard route')
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
