'use client'

import { useState } from 'react'

interface ChainIconProps {
  /** The chain's internal name, e.g. "base_mainnet" */
  chain?: string
  /** Chain display name, used as the alt text and tooltip */
  label?: string
  size?: number
}

// Icons live in public/chains, named after the chain's `name` so new chains
// only need a file dropped in.
const iconPath = (chain: string) => `/chains/${chain}.jpg`

export default function ChainIcon({ chain, label, size = 16 }: ChainIconProps) {
  const [failed, setFailed] = useState(false)

  if (!chain || failed) return null

  return (
    <img
      src={iconPath(chain)}
      alt={label || chain}
      title={label || chain}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '4px',
        flexShrink: 0,
        objectFit: 'cover',
        display: 'block',
        // Parent rows often use align-items: baseline, which would drop the
        // icon below the text; centre it regardless.
        alignSelf: 'center',
      }}
    />
  )
}
