import { Interface, AbiCoder } from 'ethers'
import strategyNFTABI from './StrategyNFT.abi.json'

// 1. CONFIGURATION
export const STRATEGY_NFT_CONTRACT = process.env.NEXT_PUBLIC_STRATEGY_NFT_ADDRESS as `0x${string}`
export const STRATEGY_NFT_ABI = strategyNFTABI
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// 2. INTERFACES
const nftInterface = new Interface(STRATEGY_NFT_ABI)

// Minimal ERC20 Interface for allowance/approval logic
const erc20Interface = new Interface([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
])

// 3. READ FUNCTIONS (For the "On-the-fly" check)
// These prepare the "data" string for an eth_call

export function encodeGetMintFee(): `0x${string}` {
  return nftInterface.encodeFunctionData('mintFee') as `0x${string}`
}

export function encodeGetFeeToken(): `0x${string}` {
  return nftInterface.encodeFunctionData('feeToken') as `0x${string}`
}

// 4. DECODERS (Turning hex responses back into usable JS types)

export function decodeUint256(data: string): bigint {
  try {
    return AbiCoder.defaultAbiCoder().decode(['uint256'], data)[0]
  } catch {
    return BigInt(0)
  }
}

export function decodeAddress(data: string): string {
  try {
    return AbiCoder.defaultAbiCoder().decode(['address'], data)[0]
  } catch {
    return ZERO_ADDRESS
  }
}

// 5. ERC20 ENCODERS (For checking/giving permission to spend tokens)

export function encodeAllowance(owner: string, spender: string): `0x${string}` {
  return erc20Interface.encodeFunctionData('allowance', [owner, spender]) as `0x${string}`
}

export function encodeApprove(spender: string, amount: bigint): `0x${string}` {
  return erc20Interface.encodeFunctionData('approve', [spender, amount]) as `0x${string}`
}

// 6. YOUR ORIGINAL FUNCTIONS (Minting & Strategy Retrieval)

export function encodeMintStrategy(strategyJson: string): `0x${string}` {
  return nftInterface.encodeFunctionData('mintStrategy', [strategyJson]) as `0x${string}`
}

export function encodeGetStrategy(tokenId: number): `0x${string}` {
  return nftInterface.encodeFunctionData('getStrategy', [tokenId]) as `0x${string}`
}

export function decodeStrategyResponse(data: string): string {
  const decoded = nftInterface.decodeFunctionResult('getStrategy', data)
  return decoded[0]
}

/*
import { Interface } from 'ethers'
import strategyNFTABI from './StrategyNFT.abi.json'

// Contract address for the Strategy NFT
export const STRATEGY_NFT_CONTRACT = process.env.NEXT_PUBLIC_STRATEGY_NFT_ADDRESS as `0x${string}`

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

*/