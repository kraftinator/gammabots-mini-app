'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column' as const,
    paddingBottom: '80px',
  },
  header: {
    padding: '16px',
    backgroundColor: '#fff',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    padding: '0',
    marginBottom: '16px',
    cursor: 'pointer',
    color: '#14b8a6',
    fontSize: '14px',
    fontWeight: '500' as const,
  },
  title: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  content: {
    flex: 1,
    padding: '16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  copyButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600' as const,
    backgroundColor: '#14b8a6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  copyButtonCopied: {
    backgroundColor: '#059669',
  },
  textContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e5e5',
    maxHeight: '400px',
    overflow: 'auto',
  },
  preText: {
    margin: 0,
    fontSize: '12px',
    fontFamily: 'ui-monospace, monospace',
    color: '#333',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    lineHeight: '1.5',
  },
  loading: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    padding: '20px',
  },
  error: {
    fontSize: '14px',
    color: '#c00',
    textAlign: 'center' as const,
    padding: '20px',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginTop: '16px',
    lineHeight: '1.5',
  },
}

export default function GammaScriptForLLMsPage() {
  const router = useRouter()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/llms.txt')
        if (!response.ok) {
          throw new Error('Failed to load content')
        }
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError('Failed to load documentation')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 style={styles.title}>GammaScript for LLMs</h1>
        <p style={styles.subtitle}>Copy this document and paste it into your favorite LLM</p>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          {loading && (
            <p style={styles.loading}>Loading...</p>
          )}

          {error && (
            <p style={styles.error}>{error}</p>
          )}

          {content && (
            <>
              <button
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  ...(copied ? styles.copyButtonCopied : {}),
                }}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>

              <div style={styles.textContainer}>
                <pre style={styles.preText}>{content}</pre>
              </div>

              <p style={styles.hint}>
                Paste this into an LLM to help you write GammaScript strategies.
              </p>
            </>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  )
}
