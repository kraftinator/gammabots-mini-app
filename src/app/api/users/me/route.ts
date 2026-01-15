import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const GET = withAuth(async (request: NextRequest, auth) => {
  try {
    const url = `${auth.apiUrl}/users/me`

    const response = await callExternalAPI(url, auth, {
      method: 'GET'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const userData = await response.json()
    return NextResponse.json(userData)

  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
