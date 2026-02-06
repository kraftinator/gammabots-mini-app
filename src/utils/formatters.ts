// Helper function to format token amounts with compacting (K, M)
export const formatTokenAmount = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
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

// Format active time from seconds
export const formatActiveTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} seconds`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
  }
}
