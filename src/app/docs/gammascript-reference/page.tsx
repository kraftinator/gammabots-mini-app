'use client'

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
  intro: {
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  categoryHeader: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#14b8a6',
    marginTop: '24px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e5e5',
  },
  firstCategoryHeader: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#14b8a6',
    marginTop: '0',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e5e5',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  fieldLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  fieldName: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  fieldLabel: {
    fontSize: '13px',
    color: '#666',
  },
  fieldCode: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#0891b2',
    backgroundColor: '#f0f9fa',
    padding: '2px 8px',
    borderRadius: '4px',
  },
}

const fields = {
  'Position & Trades': [
    { name: 'tokenAmt', code: 'bta', label: 'Token Amount' },
    { name: 'buyCount', code: 'bcn', label: 'Buy Count' },
    { name: 'sellCount', code: 'scn', label: 'Sell Count' },
    { name: 'movingAvg', code: 'mam', label: 'Moving Average (Minutes)' },
    { name: 'lastSellPrice', code: 'lsp', label: 'Last Sell Price' },
  ],
  'Prices': [
    { name: 'currentPrice', code: 'cpr', label: 'Current Price' },
    { name: 'prevPrice', code: 'ppr', label: 'Previous Price' },
    { name: 'initBuyPrice', code: 'ibp', label: 'Initial Buy Price' },
    { name: 'rollingHigh', code: 'rhi', label: 'Rolling High' },
    { name: 'creationPrice', code: 'cap', label: 'Creation Price' },
    { name: 'highSinceCreate', code: 'hps', label: 'High Since Creation' },
    { name: 'lowSinceCreate', code: 'lps', label: 'Low Since Creation' },
    { name: 'highInitBuy', code: 'hip', label: 'High Since Initial Buy' },
    { name: 'lowInitBuy', code: 'lip', label: 'Low Since Initial Buy' },
    { name: 'highLastTrade', code: 'hlt', label: 'High Since Last Trade' },
    { name: 'lowLastTrade', code: 'llt', label: 'Low Since Last Trade' },
    { name: 'listedBuyPrice', code: 'lbp', label: 'Listed Buy Price' },
    { name: 'priceDiv', code: 'pdi', label: 'Price Diversity' },
  ],
  'Moving Averages': [
    { name: 'cma', code: 'cma', label: 'Current Moving Average' },
    { name: 'lma', code: 'lma', label: 'Long Moving Average' },
    { name: 'tma', code: 'tma', label: 'Trend Moving Average' },
    { name: 'prevCMA', code: 'pcm', label: 'Previous CMA' },
    { name: 'prevLMA', code: 'plm', label: 'Previous LMA' },
    { name: 'lowCMASinceCreate', code: 'lmc', label: 'Low CMA (Since Creation)' },
    { name: 'highCMASinceInit', code: 'hma', label: 'High CMA (Since Initial Buy)' },
    { name: 'lowCMASinceInit', code: 'lmi', label: 'Low CMA (Since Initial Buy)' },
    { name: 'highCMASinceTrade', code: 'hmt', label: 'High CMA (Since Last Trade)' },
    { name: 'lowCMASinceTrade', code: 'lmt', label: 'Low CMA (Since Last Trade)' },
  ],
  'Volatility & Momentum': [
    { name: 'mom', code: 'mom', label: 'Momentum' },
    { name: 'vst', code: 'vst', label: 'Volatility (Short)' },
    { name: 'vlt', code: 'vlt', label: 'Volatility (Long)' },
    { name: 'ssd', code: 'ssd', label: 'Standard Deviation (Short)' },
    { name: 'lsd', code: 'lsd', label: 'Standard Deviation (Long)' },
  ],
  'Profitability': [
    { name: 'profitLastCycle', code: 'lcp', label: 'Profit (Last Cycle)' },
    { name: 'profitSecondCycle', code: 'scp', label: 'Profit (2nd Cycle)' },
    { name: 'botProfit', code: 'bpp', label: 'Total Bot Profit' },
  ],
  'Timing': [
    { name: 'minSinceTrade', code: 'lta', label: 'Minutes Since Last Trade' },
    { name: 'minSinceBuy', code: 'lba', label: 'Minutes Since Last Buy' },
    { name: 'minSinceCreate', code: 'crt', label: 'Minutes Since Creation' },
  ],
}

export default function GammascriptReferencePage() {
  const router = useRouter()

  const categories = Object.keys(fields) as (keyof typeof fields)[]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 style={styles.title}>Gammascript Reference</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <p style={styles.intro}>
            A complete reference of all variables available in Gammascript.
          </p>

          {categories.map((category, categoryIndex) => (
            <div key={category}>
              <h2 style={categoryIndex === 0 ? styles.firstCategoryHeader : styles.categoryHeader}>
                {category}
              </h2>
              {fields[category].map((field) => (
                <div key={field.name} style={styles.fieldRow}>
                  <div style={styles.fieldLeft}>
                    <span style={styles.fieldName}>{field.name}</span>
                    <span style={styles.fieldLabel}>{field.label}</span>
                  </div>
                  <span style={styles.fieldCode}>{field.code}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  )
}
