import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  // /api/bots/[id]/trades/[tradeId]/metrics
  const botId = pathParts[pathParts.length - 4] // bots/[id]/trades/[tradeId]/metrics
  const tradeId = pathParts[pathParts.length - 2]

  console.log('Get Trade Metrics API called for bot:', botId, 'trade:', tradeId)

  try {
    const apiUrl = `${auth.apiUrl}/bots/${botId}/trades/${tradeId}/metrics`

    console.log('Proxying to Rails backend:', apiUrl)

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch trade metrics' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const metricsData = await response.json()
    console.log('✅ Trade metrics fetched successfully')
    return NextResponse.json(metricsData)

  } catch (error) {
    console.error('Error fetching trade metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
