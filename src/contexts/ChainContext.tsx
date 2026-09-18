'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

export const DEFAULT_CHAIN_NAME = 'base_mainnet'

export interface Chain {
  name: string
  display_name: string
  native_chain_id: string
  explorer_url: string
}

interface ChainContextType {
  chains: Chain[]
  chainsLoaded: boolean
  fetchChains: (token: string) => Promise<void>
  getChain: (name?: string | null) => Chain | undefined
  explorerTxUrl: (chainName: string | null | undefined, txHash: string) => string | null
}

const ChainContext = createContext<ChainContextType | null>(null)

export function ChainProvider({ children }: { children: ReactNode }) {
  const [chains, setChains] = useState<Chain[]>([])
  const [chainsLoaded, setChainsLoaded] = useState(false)
  // Chains are effectively static, so only fetch once per session even though
  // several pages call fetchChains after they authenticate.
  const fetchedRef = useRef(false)

  const fetchChains = useCallback(async (token: string) => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    try {
      const response = await fetch('/api/chains', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const list: Chain[] = Array.isArray(data) ? data : data.chains || []
        console.log('🔗 Chains loaded:', list)
        setChains(list)
        setChainsLoaded(true)
      } else {
        // Allow a retry on the next call; callers fall back to the default chain.
        fetchedRef.current = false
        console.warn('Failed to fetch chains:', response.status)
      }
    } catch (error) {
      fetchedRef.current = false
      console.warn('Error fetching chains:', error)
    }
  }, [])

  const getChain = useCallback((name?: string | null): Chain | undefined => {
    if (!name) return undefined
    return chains.find(c => c.name === name)
  }, [chains])

  const explorerTxUrl = useCallback((chainName: string | null | undefined, txHash: string): string | null => {
    if (!txHash) return null
    const base = getChain(chainName)?.explorer_url
    if (!base) return null
    return `${base.replace(/\/+$/, '')}/tx/${txHash}`
  }, [getChain])

  return (
    <ChainContext.Provider value={{ chains, chainsLoaded, fetchChains, getChain, explorerTxUrl }}>
      {children}
    </ChainContext.Provider>
  )
}

export function useChains() {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useChains must be used within a ChainProvider')
  }
  return context
}
