// Helper function to format token amounts with compacting (K, M)
export const formatTokenAmount = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 10000) {
    return `${(value / 1000).toFixed(0)}K`
  } else if (value >= 1) {
    return Math.floor(value).toLocaleString()
  } else {
    return Number(value).toFixed(2)
  }
}

// Helper function to format numbers with comma separators
export const formatNumber = (value: number): string => {
  return value.toLocaleString()
}
