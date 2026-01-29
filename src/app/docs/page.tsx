'use client'

import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

export default function DocsPage() {
  const router = useRouter()

  const docs = [
    {
      title: 'How it Works',
      description: 'Learn how Gammabots works and how to get started.',
      href: '/docs/how-it-works',
    },
    {
      title: 'What is GammaScript?',
      description: 'Understand the language used to define trading strategies.',
      href: '/docs/what-is-gammascript',
    },
    {
      title: 'GammaScript Reference',
      description: 'A complete reference of all variables available in GammaScript.',
      href: '/docs/gammascript-reference',
    },
    {
      title: 'GammaScript for LLMs',
      description: 'Copy this document to help an LLM write GammaScript for you.',
      href: '/docs/gammascript-for-llms',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <button
          onClick={() => router.back()}
          style={{
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
            fontWeight: '500',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: 0,
        }}>
          Documentation
        </h1>
      </div>

      {/* Docs List */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          {docs.map((doc, index) => (
            <div
              key={doc.href}
              onClick={() => router.push(doc.href)}
              style={{
                padding: '16px 20px',
                borderBottom: index < docs.length - 1 ? '1px solid #e5e7eb' : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#1a1a1a',
                marginBottom: '4px',
              }}>
                {doc.title}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
              }}>
                {doc.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  )
}
