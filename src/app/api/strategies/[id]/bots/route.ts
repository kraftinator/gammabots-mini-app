import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('Strategy Bots API called for strategy:', id)

  const apiUrl = process.env.GAMMABOTS_API_URL
  const apiKey = process.env.GAMMABOTS_API_KEY

  if (!apiUrl || !apiKey) {
    console.error('Missing Gammabots API configuration')
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 500 }
    )
  }

  try {
    // Forward query parameters to the backend
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${apiUrl}/strategies/${id}/bots${searchParams ? `?${searchParams}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    })

    if (!response.ok) {
      console.error('Gammabots API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch strategy bots from Gammabots API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Strategy bots received successfully')
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in strategy bots API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
