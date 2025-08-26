'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MyBotsPage() {
  const [isReady, setIsReady] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>('guest') // Default fallback for development

  useEffect(() => {
    const initializePage = async () => {
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
        } else {
          console.log('Not running in Mini App environment')
        }
      } catch (error) {
        console.error('Error initializing page:', error)
        setIsReady(true)
      }
    }

    initializePage()
  }, [])

  if (!isReady) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "#f8f9ff",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ 
          fontSize: "16px", 
          color: "#8e8e93",
          textAlign: "center"
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9ff",
      fontFamily: "'Inter', sans-serif",
      paddingTop: "20px",
      paddingBottom: "100px"
    }}>
      <div style={{
        maxWidth: "420px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        {/* Hero Section */}
        <div style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px"
          }}>
            <div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "white",
                margin: "0 0 8px 0"
              }}>
                Gammabots
              </h1>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "white",
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>Welcome, @{username}</div>
            </div>
          </div>
          <div style={{
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.8)",
            marginBottom: "20px"
          }}>
            Manage your trading bots
          </div>
          <div style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px"
          }}>
            <button style={{
              padding: "16px 20px",
              borderRadius: "25px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "700",
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
              background: "#3b82f6",
              color: "white"
            }}>
              Create Bot
            </button>
            <button style={{
              padding: "16px 20px",
              borderRadius: "25px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "700",
              fontSize: "15px",
              border: "2px solid #3b82f6",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
              background: "white",
              color: "#3b82f6"
            }}>
              My Bots (0)
            </button>
          </div>
        </div>



        {/* Main Content - Bot List Placeholder */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "16px",
            opacity: 0.3
          }}>
            🤖
          </div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1c1c1e",
            margin: "0 0 8px 0"
          }}>
            Your bots will appear here
          </h2>
          <p style={{
            fontSize: "14px",
            color: "#8e8e93",
            margin: "0",
            lineHeight: "1.4"
          }}>
            When you create your first bot, it will be displayed on this page with real-time performance metrics.
          </p>
          <button style={{
            marginTop: "24px",
            padding: "12px 24px",
            borderRadius: "20px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "600",
            fontSize: "14px",
            border: "2px solid #8B5CF6",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textAlign: "center",
            background: "white",
            color: "#8B5CF6"
          }}>
            Create Your First Bot
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 100
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <NavItem label="HOME" />
        </Link>
        <NavItem label="MY BOTS" active={true} />
        <NavItem label="LEADERBOARD" />
        <NavItem label="STRATEGIES" />
      </div>
    </div>
  )
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div style={{
      flex: 1,
      padding: "12px 8px 16px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: active ? "#8b5cf6" : "#8e8e93",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      margin: "8px 4px",
      position: "relative"
    }}>
      {label}
      {active && (
        <div style={{
          content: '',
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "20px",
          height: "3px",
          background: "#8b5cf6",
          borderRadius: "1px"
        }}></div>
      )}
    </div>
  )
}
