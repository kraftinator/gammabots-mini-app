import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  // Extract the strategy ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  // Path is /api/strategies/[id]/mint_status, so id is at index -2
  const id = pathParts[pathParts.length - 2]

  try {
    const apiUrl = `${auth.apiUrl}/strategies/${id}/mint_status`

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch mint status' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching mint status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
