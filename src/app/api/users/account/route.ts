import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (_request: NextRequest, auth) => {
  try {
    const url = `${auth.apiUrl}/users/account`
    const response = await callExternalAPI(url, auth)

    if (!response.ok) {
      console.error('Gammabots users/account API error:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Failed to get account' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const accountData = await response.json()
    return NextResponse.json(accountData)

  } catch (error) {
    console.error('Error getting account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
