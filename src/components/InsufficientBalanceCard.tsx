'use client'

import { InsufficientBalanceInfo } from '@/hooks/useMintStrategy'

interface InsufficientBalanceCardProps {
  info: InsufficientBalanceInfo
}

export default function InsufficientBalanceCard({ info }: InsufficientBalanceCardProps) {
  return (
    <div style={{
      backgroundColor: '#fef3c7',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '16px',
      border: '1px solid #fcd34d',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#92400e',
        marginBottom: '8px',
      }}>
        Insufficient Balance
      </div>
      <div style={{
        fontSize: '13px',
        color: '#78350f',
        marginBottom: '12px',
      }}>
        You need at least {info.required} {info.symbol} to mint this strategy, but you currently have {info.current}.
      </div>
      <div style={{
        fontSize: '13px',
        color: '#78350f',
        marginBottom: '12px',
      }}>
        Please fund your wallet and try again.
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '12px', color: '#92400e' }}>
          Token: {info.tokenAddress.slice(0, 6)}...{info.tokenAddress.slice(-4)}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(info.tokenAddress)}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: '#fde68a',
            border: '1px solid #fcd34d',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#78350f',
          }}
        >
          Copy
        </button>
      </div>
    </div>
  )
}
