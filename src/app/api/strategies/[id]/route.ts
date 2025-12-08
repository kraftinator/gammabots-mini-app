import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  // Extract the strategy ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1] // Gets the ID from /api/strategies/[id]

  console.log('Get Strategy API called for strategy:', id)

  try {
    const apiUrl = `${auth.apiUrl}/strategies/${id}`

    console.log('Proxying to Rails backend:', apiUrl)

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'GET'
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch strategy' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const strategyData = await response.json()
    console.log('✅ Strategy fetched successfully')
    return NextResponse.json(strategyData)

  } catch (error) {
    console.error('Error fetching strategy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
