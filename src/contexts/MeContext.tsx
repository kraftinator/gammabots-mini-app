'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Me {
  user_exists: boolean
  id: number | null
  fid: number | null
  farcaster_username: string | null
  farcaster_avatar_url: string | null
  wallet_address: string | null
}

interface MeContextType {
  me: Me | null
  fetchMe: (token: string) => Promise<void>
}

const MeContext = createContext<MeContextType | null>(null)

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)

  const fetchMe = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMe(data)
      }
    } catch (error) {
      console.warn('Error fetching current user:', error)
    }
  }, [])

  return (
    <MeContext.Provider value={{ me, fetchMe }}>
      {children}
    </MeContext.Provider>
  )
}

export function useMe() {
  const context = useContext(MeContext)
  if (!context) {
    throw new Error('useMe must be used within a MeProvider')
  }
  return context
}
