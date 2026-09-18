import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  try {
    // Forward query parameters (notably `chain`) to the backend
    const searchParams = request.nextUrl.searchParams.toString()
    const apiUrl = `${auth.apiUrl}/bots/gas_reserve${searchParams ? `?${searchParams}` : ''}`

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    if (!response.ok) {
      console.error('Gammabots Gas Reserve API error:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch gas reserve' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching gas reserve:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
