import { NextRequest, NextResponse } from 'next/server'
import { withAuth, callExternalAPI } from '@/lib/apiAuth'

export const POST = withAuth(async (request: NextRequest, auth) => {
  console.log('Create User API called (sign up) with token:', auth.token.slice(0, 20), '...')

  try {
    const body = await request.json()
    const url = `${auth.apiUrl}/users`

    console.log('Proxying to Rails backend:', url)

    const response = await callExternalAPI(url, auth, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    console.log('Rails response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create user' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const userData = await response.json()
    console.log('✅ User created successfully')
    return NextResponse.json(userData)

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
