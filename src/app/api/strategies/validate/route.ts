import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const POST = withAuth(async (request: NextRequest, auth) => {
  console.log('Validate Strategy API called with authenticated token:', auth.token.slice(0, 20), '...')

  try {
    const body = await request.json()
    const url = `${auth.apiUrl}/strategies/validate`
    
    const response = await callExternalAPI(url, auth, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('Gammabots Validate Strategy API error:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Failed to validate strategy' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const validationData = await response.json()
    console.log('✅ Strategy validated successfully')
    return NextResponse.json(validationData)
    
  } catch (error) {
    console.error('Error validating strategy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})