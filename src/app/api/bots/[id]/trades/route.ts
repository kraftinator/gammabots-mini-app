import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  // Extract the bot ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 2] // Gets the ID from /api/bots/[id]/trades

  console.log('Get Bot Trades API called for bot:', id)

  try {
    const apiUrl = `${auth.apiUrl}/bots/${id}/trades`

    console.log('Proxying to Rails backend:', apiUrl)

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch bot trades' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const tradesData = await response.json()
    console.log('✅ Bot trades fetched successfully')
    return NextResponse.json(tradesData)

  } catch (error) {
    console.error('Error fetching bot trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
