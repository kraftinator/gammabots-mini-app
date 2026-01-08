import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')

    const url = walletAddress
      ? `${auth.apiUrl}/strategies/mint_details?wallet_address=${walletAddress}`
      : `${auth.apiUrl}/strategies/mint_details`

    const response = await callExternalAPI(url, auth)

    if (!response.ok) {
      console.error('Gammabots mint_details API error:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Failed to get mint details' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const mintDetails = await response.json()
    return NextResponse.json(mintDetails)

  } catch (error) {
    console.error('Error getting mint details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
