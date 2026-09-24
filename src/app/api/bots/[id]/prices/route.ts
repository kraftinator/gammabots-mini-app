import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  // Extract the bot ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 2] // Gets the ID from /api/bots/[id]/prices

  try {
    // Forward query parameters (notably `hours`) to the backend
    const searchParams = request.nextUrl.searchParams.toString()
    const apiUrl = `${auth.apiUrl}/bots/${id}/prices${searchParams ? `?${searchParams}` : ''}`

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    if (!response.ok) {
      console.error('Gammabots Prices API error:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch prices' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
