import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const POST = withAuth(async (request: NextRequest, auth) => {
  try {
    // Extract the bot ID from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 2] // Gets the ID from /api/bots/[id]/cancel-funding

    // Construct the URL for the external API
    const apiUrl = `${auth.apiUrl}/bots/${id}/cancel_funding`

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'POST'
    })

    if (!response.ok) {
      console.error('Gammabots Cancel Funding API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to cancel funding' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error cancelling funding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
