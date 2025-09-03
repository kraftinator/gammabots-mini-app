import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  console.log('Dashboard API called with authenticated token:', auth.token.slice(0, 20), '...')

  // Construct the URL
  const url = `${auth.apiUrl}/dashboard_metrics`
  
  try {
    const response = await callExternalAPI(url, auth)

    if (!response.ok) {
      console.error('Gammabots Dashboard API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics from Gammabots API' },
        { status: response.status }
      )
    }

    const dashboardData = await response.json()
    console.log('✅ Dashboard data received and returned successfully')
    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})