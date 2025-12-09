import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const PATCH = withAuth(async (request: NextRequest, auth) => {
  // Extract the bot ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 1] // Gets the ID from /api/bots/[id]

  console.log('Update Bot API called for bot:', id)

  try {
    const body = await request.json()
    const apiUrl = `${auth.apiUrl}/bots/${id}`

    console.log('Proxying PATCH to Rails backend:', apiUrl)
    console.log('Request body:', body)

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update bot' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const botData = await response.json()
    console.log('✅ Bot updated successfully')
    return NextResponse.json(botData)

  } catch (error) {
    console.error('Error updating bot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
