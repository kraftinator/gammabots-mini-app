import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  // Get authorization header from request
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json(
      { valid: false, error: 'missing bearer token' },
      { status: 401 }
    )
  }

  if (!address) {
    return NextResponse.json(
      { valid: false, error: 'Address parameter is required' },
      { status: 400 }
    )
  }

  const apiUrl = process.env.GAMMABOTS_API_URL
  const apiKey = process.env.GAMMABOTS_API_KEY

  if (!apiUrl || !apiKey) {
    console.error('Missing Gammabots API configuration')
    return NextResponse.json(
      { valid: false, error: 'API configuration missing' },
      { status: 500 }
    )
  }

  try {
    const url = `${apiUrl}/tokens/lookup?address=${encodeURIComponent(address)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Authorization': authHeader
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in tokens lookup API:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
