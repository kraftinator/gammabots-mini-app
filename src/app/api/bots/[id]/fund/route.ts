import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const POST = withAuth(async (request: NextRequest, auth) => {
  console.log('Fund Bot API called with authenticated token:', auth.token.slice(0, 20), '...')

  try {
    // Extract the bot ID from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 2] // Gets the ID from /api/bots/[id]/fund
    
    const body = await request.json()
    
    // Construct the URL for the external API
    const apiUrl = `${auth.apiUrl}/bots/${id}/fund`
    
    const response = await callExternalAPI(apiUrl, auth, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('Gammabots Fund Bot API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fund bot' },
        { status: response.status }
      )
    }

    const fundData = await response.json()
    console.log('✅ Bot funded successfully')
    return NextResponse.json(fundData)
    
  } catch (error) {
    console.error('Error funding bot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
