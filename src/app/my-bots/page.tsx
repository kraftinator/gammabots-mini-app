'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Bot {
  bot_id: string
  token_symbol: string
  strategy_id: string
  // Add other fields as we discover them
}

export default function MyBotsPage() {
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>('guest')
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [bots, setBots] = useState<Bot[]>([])
  const [botsLoading, setBotsLoading] = useState(false)
  const [botsError, setBotsError] = useState<string | null>(null)

  useEffect(() => {
    async function initializePage() {
      try {
        setIsReady(true)
        
        // Try to load the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Check if we're running in a Mini App environment
        const inMiniApp = await sdk.isInMiniApp()
        setIsMiniApp(inMiniApp)

        if (inMiniApp) {
          // We're in a Mini App, call ready to hide splash screen
          await sdk.actions.ready()
          console.log('My Bots page is ready!')
          
          // Get user context to display actual username
          try {
            const context = await sdk.context
            if (context?.user?.username) {
              setUsername(context.user.username)
            }
          } catch (contextError) {
            console.log('Could not get user context:', contextError)
          }

          // Now perform Quick Auth and fetch bots
          await authenticateAndFetchBots(sdk)
        } else {
          console.log('Not running in Mini App environment')
          setAuthLoading(false)
          setAuthError('Not running in Farcaster Mini App environment')
        }
      } catch (error) {
        console.error('Error initializing page:', error)
        setIsReady(true)
        setAuthLoading(false)
        setAuthError('Failed to initialize page')
      }
    }

    async function authenticateAndFetchBots(sdk: typeof import('@farcaster/miniapp-sdk').sdk) {
      try {
        setAuthLoading(true)
        setAuthError(null)

        // Perform Quick Auth
        const { token } = await sdk.quickAuth.getToken()
        
        if (typeof token !== "string" || token.length === 0) {
          throw new Error("Quick Auth did not return a valid token")
        }

        console.log("QA token received:", token.slice(0, 20), "...")
        
        // Auth successful, now fetch bots
        setAuthLoading(false)
        await fetchBots(token)

      } catch (error: unknown) {
        console.error('Authentication failed:', error)
        setAuthLoading(false)
        setAuthError(error instanceof Error ? error.message : 'Authentication failed')
      }
    }

    async function fetchBots(token: string) {
      try {
        setBotsLoading(true)
        setBotsError(null)

        const response = await fetch('/api/bots', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Raw API response:', data)
        
        const botsArray = Array.isArray(data) ? data : data.bots || []
        console.log('Processed bots array:', botsArray)
        setBots(botsArray)
        
      } catch (error: unknown) {
        console.error('Failed to fetch bots:', error)
        setBotsError(error instanceof Error ? error.message : 'Failed to fetch bots')
      } finally {
        setBotsLoading(false)
      }
    }

    initializePage()
  }, [])

  if (!isReady) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
      }}>
        <p style={{ color: '#fff' }}>Loading...</p>
      </div>
    )
  }
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '20px',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0'
          }}>
            My Bots
          </h1>
          <p style={{
            margin: 0,
            color: '#888',
            fontSize: '14px'
          }}>
            {isMiniApp ? `@${username}` : 'Web Browser Mode'}
          </p>
        </div>
      </div>

      {/* Auth Status */}
      {authLoading && (
        <div style={{
          backgroundColor: '#111',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#888', margin: 0 }}>
            Authenticating...
          </p>
        </div>
      )}

      {authError && (
        <div style={{
          backgroundColor: '#332211',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          border: '1px solid #664433'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#ffaa44'
          }}>
            Authentication Error
          </h3>
          <p style={{
            color: '#ffaa44',
            margin: 0,
            fontSize: '14px'
          }}>
            {authError}
          </p>
        </div>
      )}

      {/* Bots Content */}
      {!authLoading && !authError && (
        <>
          {/* Main Content */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '0 0 16px 0'
            }}>
              Your Trading Bots
            </h2>
            <p style={{
              color: '#888',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Manage your automated trading bots and monitor their performance.
            </p>
          </div>

          {/* Bots List */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              color: '#fff'
            }}>
              Active Bots
            </h3>

            {botsLoading && (
              <div style={{
                color: '#888',
                textAlign: 'center',
                padding: '20px'
              }}>
                <p>Loading bots...</p>
              </div>
            )}

            {botsError && (
              <div style={{
                backgroundColor: '#331111',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #664444'
              }}>
                <p style={{
                  color: '#ff6666',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  Error loading bots: {botsError}
                </p>
              </div>
            )}

            {!botsLoading && !botsError && (
              <>
                {bots.length === 0 ? (
                  <div style={{
                    color: '#888',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    <p>No bots configured yet.</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      Create your first trading bot to get started!
                    </p>
                  </div>
                ) : (
                  <div>
                    {bots.map((bot) => (
                      <div key={bot.bot_id} style={{
                        backgroundColor: '#222',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        border: '1px solid #333'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: 0,
                            color: '#fff'
                          }}>
                            {bot.token_symbol} Bot
                          </h4>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: '#00ff0020',
                            color: '#00ff00',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            active
                          </span>
                        </div>
                        <p style={{
                          color: '#888',
                          margin: '0 0 8px 0',
                          fontSize: '14px'
                        }}>
                          Strategy: {bot.strategy_id}
                        </p>
                        <p style={{
                          color: '#666',
                          margin: 0,
                          fontSize: '12px'
                        }}>
                          Token: {bot.token_symbol}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        borderTop: '1px solid #333',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <Link 
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#888',
            fontSize: '12px'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#666',
            borderRadius: '4px',
            marginBottom: '4px'
          }} />
          Dashboard
        </Link>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#00ff00',
          fontSize: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#00ff00',
            borderRadius: '4px',
            marginBottom: '4px'
          }} />
          My Bots
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#888',
          fontSize: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#666',
            borderRadius: '4px',
            marginBottom: '4px'
          }} />
          Settings
        </div>
      </div>
    </div>
  )
}
