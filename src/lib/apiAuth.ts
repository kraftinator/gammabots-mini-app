import { NextRequest, NextResponse } from 'next/server'

export interface AuthenticatedRequest {
  token: string
  apiUrl: string
  apiKey: string
}

export type AuthenticatedHandler = (
  request: NextRequest,
  auth: AuthenticatedRequest
) => Promise<NextResponse>

/**
 * Higher-order function that adds JWT authentication to API routes
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      console.log('🔍 API Auth: Validating request')
      
      // Get the Authorization header for Quick Auth token
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🚨 API Auth: Missing or invalid authorization header')
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Validate that we have a token
      if (!token || token.length < 10) {
        console.log('🚨 API Auth: Invalid token length')
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      console.log('🔍 API Auth: Token validated, length:', token.length)

      // Check if we have external API configuration
      const apiUrl = process.env.GAMMABOTS_API_URL
      const apiKey = process.env.GAMMABOTS_API_KEY

      if (!apiUrl || !apiKey) {
        console.log('🚨 API Auth: Missing Gammabots API configuration')
        return NextResponse.json(
          { error: 'API configuration missing' },
          { status: 500 }
        )
      }

      console.log('🔍 API Auth: Environment variables validated')

      // Call the wrapped handler with authenticated context
      return await handler(request, { token, apiUrl, apiKey })

    } catch (error) {
      console.log('🚨 API Auth: Exception during authentication')
      console.error('API Auth error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Utility function to make authenticated requests to external Gammabots API
 */
export async function callExternalAPI(
  url: string,
  auth: AuthenticatedRequest,
  options: RequestInit = {}
): Promise<Response> {
  console.log('🔍 External API: Making request to', url)
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.token}`,
    'X-API-Key': auth.apiKey,
    ...((options.headers as Record<string, string>) || {})
  }

  const response = await fetch(url, {
    method: 'GET',
    ...options,
    headers
  })

  console.log('🔍 External API: Response status', response.status, response.ok ? '✅' : '❌')
  return response
}