'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

interface Variable {
  name: string
  codes: string[]
  description: string
}

interface Category {
  id: string
  label: string
  count: number
  variables: Variable[]
}

const categories: Category[] = [
  {
    id: 'position',
    label: 'Position & Trades',
    count: 5,
    variables: [
      { name: 'Buy Count', codes: ['buyCount', 'bcn'], description: 'The number of buy trades executed in the current bot cycle.' },
      { name: 'Sell Count', codes: ['sellCount', 'scn'], description: 'The number of sell trades executed in the current bot cycle.' },
      { name: 'Token Amount', codes: ['tokenAmt', 'bta'], description: 'The amount of tokens currently held by the bot.' },
      { name: 'Moving Avg Minutes', codes: ['movingAvg', 'mam'], description: 'The configured moving average window in minutes. Used by many other variables as their calculation period.' },
      { name: 'Last Sell Price', codes: ['lastSellPrice', 'lsp'], description: 'The token price at which the bot executed its most recent sell.' }
    ]
  },
  {
    id: 'prices',
    label: 'Prices',
    count: 5,
    variables: [
      { name: 'Current Price', codes: ['currentPrice', 'cpr'], description: 'The token\'s market price for the current minute, expressed in ETH. This value represents the most recently recorded price and is updated once per minute as new price data is collected.' },
      { name: 'Previous Price', codes: ['prevPrice', 'ppr'], description: 'The token price from the previous minute. This value represents the most recent recorded price prior to the current minute\'s price.' },
      { name: 'Initial Buy Price', codes: ['initBuyPrice', 'ibp'], description: 'The token price at which the bot executed its first buy in the current position. This value is recorded at the time the initial buy trade is completed and remains constant until the position is fully exited.' },
      { name: 'Listed Buy Price', codes: ['listedBuyPrice', 'lbp'], description: 'The token\'s market price at the moment the buy order was submitted. This value reflects the system\'s current price when the buy was initiated, before execution. It often differs from the Initial Buy Price due to slippage during trade execution.' },
      { name: 'Creation Price', codes: ['creationPrice', 'cap'], description: 'The token\'s market price at the moment a new bot cycle starts. This value is recorded when the cycle begins (before any initial buy occurs) and does not change during that cycle.' }
    ]
  },
  {
    id: 'extremes',
    label: 'Price Extremes',
    count: 7,
    variables: [
      { name: 'Rolling High', codes: ['rollingHigh', 'rhi'], description: 'The highest token price observed over the last Moving Average. If Moving Average is set to 6, Rolling High looks at the token\'s price readings from the last 6 minutes and returns the highest one.' },
      { name: 'Highest Since Create', codes: ['highSinceCreate', 'hps'], description: 'The highest token price observed since the start of the current bot cycle. This value updates whenever a new high is reached.' },
      { name: 'Lowest Since Create', codes: ['lowSinceCreate', 'lps'], description: 'The lowest token price observed since the start of the current bot cycle. This value updates whenever a new low is reached.' },
      { name: 'Highest Since Initial Buy', codes: ['highInitBuy', 'hip'], description: 'The highest token price observed since the bot executed its initial buy. This value updates whenever a new high is reached.' },
      { name: 'Lowest Since Initial Buy', codes: ['lowInitBuy', 'lip'], description: 'The lowest token price observed since the bot executed its initial buy. This value updates whenever a new low is reached.' },
      { name: 'Highest Since Last Trade', codes: ['highLastTrade', 'hlt'], description: 'The highest token price observed since the bot executed its last trade. This value updates whenever a new high is reached.' },
      { name: 'Lowest Since Last Trade', codes: ['lowLastTrade', 'llt'], description: 'The lowest token price observed since the bot executed its last trade. This value updates whenever a new low is reached.' }
    ]
  },
  {
    id: 'moving',
    label: 'Moving Averages',
    count: 10,
    variables: [
      { name: 'Current Moving Avg', codes: ['cma', 'cma'], description: 'The current moving average price of the token, calculated over the configured Moving Average window.' },
      { name: 'Long Moving Avg', codes: ['lma', 'lma'], description: 'The long moving average price of the token, calculated over twice the configured Moving Average window.' },
      { name: 'Triple Moving Avg', codes: ['tma', 'tma'], description: 'The triple moving average price of the token, calculated over three times the configured Moving Average window.' },
      { name: 'Previous CMA', codes: ['prevCMA', 'pcm'], description: 'The current moving average from the previous minute.' },
      { name: 'Previous LMA', codes: ['prevLMA', 'plm'], description: 'The long moving average from the previous minute.' },
      { name: 'Lowest CMA Since Create', codes: ['lowCMASinceCreate', 'lmc'], description: 'The lowest current moving average observed since the start of the current bot cycle. This value updates whenever a new low is reached.' },
      { name: 'Highest CMA Since Initial Buy', codes: ['highCMASinceInit', 'hma'], description: 'The highest current moving average observed since the bot executed its initial buy. This value updates whenever a new high is reached.' },
      { name: 'Lowest CMA Since Initial Buy', codes: ['lowCMASinceInit', 'lmi'], description: 'The lowest current moving average observed since the bot executed its initial buy. This value updates whenever a new low is reached.' },
      { name: 'Highest CMA Since Last Trade', codes: ['highCMASinceTrade', 'hmt'], description: 'The highest current moving average observed since the bot executed its last trade. This value updates whenever a new high is reached.' },
      { name: 'Lowest CMA Since Last Trade', codes: ['lowCMASinceTrade', 'lmt'], description: 'The lowest current moving average observed since the bot executed its last trade. This value updates whenever a new low is reached.' }
    ]
  },
  {
    id: 'volatility',
    label: 'Volatility & Momentum',
    count: 6,
    variables: [
      { name: 'Momentum', codes: ['mom', 'mom'], description: 'A measure of price direction over the Moving Average window. Returns a value between 0 and 1, representing the proportion of minutes where price increased compared to the previous minute. A value of 1 means every price in the window is higher than the previous price.' },
      { name: 'Price Diversity', codes: ['priceDiv', 'pdi'], description: 'A measure of price variation over the Moving Average window. Returns a value between 0 and 1, representing the proportion of unique price values. Higher values indicate more price diversity; lower values indicate prices are repeating or stable.' },
      { name: 'Volatility (Short)', codes: ['vst', 'vst'], description: 'A measure of price swing over the Moving Average window. Calculated as the difference between the highest and lowest prices, divided by the lowest price. Higher values indicate greater volatility.' },
      { name: 'Volatility (Long)', codes: ['vlt', 'vlt'], description: 'A measure of price swing over twice the Moving Average window. Calculated as the difference between the highest and lowest prices, divided by the lowest price. Higher values indicate greater volatility.' },
      { name: 'Std Dev (Short)', codes: ['ssd', 'ssd'], description: 'The standard deviation of minute-to-minute price changes over the Moving Average window. Higher values indicate more erratic price movements.' },
      { name: 'Std Dev (Long)', codes: ['lsd', 'lsd'], description: 'The standard deviation of minute-to-minute price changes over twice the Moving Average window. Higher values indicate more erratic price movements.' }
    ]
  },
  {
    id: 'profitability',
    label: 'Profitability',
    count: 3,
    variables: [
      { name: 'Profit Last Cycle', codes: ['profitLastCycle', 'lcp'], description: 'The profit or loss from the most recently completed bot cycle, expressed as a fraction (e.g., 0.05 = 5% profit).' },
      { name: 'Profit Second Cycle', codes: ['profitSecondCycle', 'scp'], description: 'The profit or loss from the second-to-last completed bot cycle, expressed as a fraction.' },
      { name: 'Bot Profit', codes: ['botProfit', 'bpp'], description: 'The overall profit or loss for the bot across all cycles, expressed as a fraction.' }
    ]
  },
  {
    id: 'timing',
    label: 'Timing',
    count: 3,
    variables: [
      { name: 'Minutes Since Create', codes: ['minSinceCreate', 'crt'], description: 'The number of minutes since the current bot cycle started.' },
      { name: 'Minutes Since Last Trade', codes: ['minSinceTrade', 'lta'], description: 'The number of minutes since the bot\'s last trade (buy or sell).' },
      { name: 'Minutes Since Last Buy', codes: ['minSinceBuy', 'lba'], description: 'The number of minutes since the bot\'s last buy.' }
    ]
  }
]

export default function GammaScriptReferencePage() {
  const router = useRouter()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb'
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
            fontWeight: '500'
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
          margin: 0
        }}>
          GammaScript Reference
        </h1>
      </div>

      {/* Intro */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{
          fontSize: '15px',
          color: '#333',
          lineHeight: '1.6',
          margin: 0
        }}>
          A complete reference of all variables available in GammaScript.
        </p>
      </div>

      {/* Categories List */}
      <div style={{
        flex: 1,
        padding: '16px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category.id)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedCategory === category.id ? '#f9fafb' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    transition: 'transform 0.2s',
                    transform: expandedCategory === category.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    display: 'inline-block'
                  }}>
                    ▶
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>
                    {category.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '13px',
                  color: '#9ca3af'
                }}>
                  {category.count}
                </span>
              </div>

              {/* Expanded Content */}
              {expandedCategory === category.id && category.variables.length > 0 && (
                <div style={{ backgroundColor: '#ffffff' }}>
                  {category.variables.map((variable) => (
                    <div
                      key={variable.codes[0]}
                      style={{
                        padding: '12px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        marginLeft: '12px',
                        borderLeft: '2px solid #d1d5db'
                      }}
                    >
                      {/* Variable Name */}
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        marginBottom: '3px'
                      }}>
                        {variable.name}
                      </div>

                      {/* Variable Codes */}
                      <div style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#14b8a6',
                        marginBottom: '8px'
                      }}>
                        {variable.codes.join(' · ')}
                      </div>

                      {/* Description */}
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line'
                      }}>
                        {variable.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* LLM Link */}
        <div style={{ marginTop: '16px' }}>
          <span
            onClick={() => router.push('/docs/gammascript-for-llms')}
            style={{
              fontSize: '14px',
              color: '#14b8a6',
              cursor: 'pointer',
            }}
          >
            → GammaScript for LLMs
          </span>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  )
}
