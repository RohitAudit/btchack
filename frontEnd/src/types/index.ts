import { StaticImageData } from "next/image"

export type TokenType = {
  name: string
  symbol: string
  logo: StaticImageData
  balance: string
  native: boolean
  tokenAddress?: string
  abi?: any
}

export type NetworkChainType = {
  chainID: number
  name: string
  logo: StaticImageData
  explorerUrl: string
  partnerChainIDs: number[]
  nativeToken: string
  testnet: boolean
  tokens: TokenType[]
}

export interface NetworkChainListType {
  [chainId: number]: NetworkChainType
}

export interface bridgeFeeType {
  lzFeeInt: number
  lzFeeString: string
}
