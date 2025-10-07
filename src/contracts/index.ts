import { Interface } from 'ethers'
import strategyNFTABI from './StrategyNFT.abi.json'

// Contract address for the Strategy NFT
//export const STRATEGY_NFT_CONTRACT = '0x4Ef33998696894eA8A30d3034Cf85788f1272b6d'
//export const STRATEGY_NFT_CONTRACT = '0x796Ee1eF04ABb9eC09d3139B3DfD342FA9f036c3'
export const STRATEGY_NFT_CONTRACT = '0x07Ce5D53c1304F322A85ab750e5AabCED997EC00'

// ABI for the Strategy NFT contract
export const STRATEGY_NFT_ABI = strategyNFTABI

// Create contract interface for proper ABI encoding
const contractInterface = new Interface(STRATEGY_NFT_ABI)

// Encode function call to read strategy from a token ID
export function encodeGetStrategy(tokenId: number): `0x${string}` {
  try {
    return contractInterface.encodeFunctionData('strategies', [tokenId]) as `0x${string}`
  } catch (error) {
    console.error('Error encoding strategies call:', error)
    throw new Error(`Failed to encode strategies call: ${error}`)
  }
}

// Decode strategy data from contract response
export function decodeStrategyResponse(data: string): string {
  try {
    const decoded = contractInterface.decodeFunctionResult('strategies', data)
    return decoded[0]
  } catch (error) {
    console.error('Error decoding strategy response:', error)
    throw new Error(`Failed to decode strategy response: ${error}`)
  }
}

// Encode function call data for mintStrategy using ethers.js
export function encodeMintStrategy(strategyJson: string): `0x${string}` {
  try {
    // Use ethers.js Interface to properly encode the function call
    const encodedData = contractInterface.encodeFunctionData('mintStrategy', [strategyJson])
    return encodedData as `0x${string}`
  } catch (error) {
    console.error('Error encoding mintStrategy call:', error)
    throw new Error(`Failed to encode mintStrategy call: ${error}`)
  }
}

