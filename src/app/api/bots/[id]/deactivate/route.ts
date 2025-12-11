import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const POST = withAuth(async (request: NextRequest, auth) => {
  // Extract the bot ID from the URL path
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const id = pathParts[pathParts.length - 2] // Gets the ID from /api/bots/[id]/deactivate

  console.log('Deactivate Bot API called for bot:', id)

  try {
    const apiUrl = `${auth.apiUrl}/bots/${id}/deactivate`

    console.log('Proxying POST to Rails backend:', apiUrl)

    const response = await callExternalAPI(apiUrl, auth, {
      method: 'POST'
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to deactivate bot' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Bot deactivated successfully')
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error deactivating bot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
