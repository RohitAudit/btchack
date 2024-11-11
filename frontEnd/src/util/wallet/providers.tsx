"use client"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { myTheme, CustomAvatar, config } from "./wagmi"
import { AptosWalletProvider } from "@razorlabs/wallet-kit"
import "@razorlabs/wallet-kit/style.css"
import "./razorlabs-wallet-kit-custom.css"
import {
  SuiWalletProvider,
  Chain,
  SuiDevnetChain,
  SuiTestnetChain,
  DefaultChains,
} from "@razorlabs/wallet-kit"

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"

import { PropsWithChildren } from "react"
import { Network } from "@aptos-labs/ts-sdk"
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css"
import { useToast } from "@/Hooks/use-toast"
export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast()
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        aptosConnect: { dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5" },
        mizuwallet: {
          manifestURL:
            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      onError={error => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        })
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
// const movement_porto: Chain = {
//   // id: "177",
//   id: "porto:testnet",
//   name: "Movement Porto Testnet",
//   rpcUrl: "https://aptos.testnet.porto.movementlabs.xyz/v1",
// }

// const movement_Suzuka: Chain = {
//   // id: "27",
//   id: "suzuka:testnet",
//   name: "Movement Suzuka Testnet",
//   rpcUrl: "https://testnet.suzuka.movementnetwork.xyz/v1",
// }

const movement_porto: Chain = {
  id: "aptos:testnet",
  name: "Movement Porto Testnet",
  rpcUrl: "https://aptos.testnet.porto.movementlabs.xyz/v1",
}

const movement_Suzuka: Chain = {
  id: "aptos:testnet",
  name: "Movement Suzuka Testnet",
  rpcUrl: "https://testnet.suzuka.movementnetwork.xyz/v1",
}
// const Aptos_testnet: Chain = {
//   id: "aptos:testnet",
//   name: "Movement Aptos Testnet",
//   rpcUrl: "https://aptos.testnet.suzuka.movementlabs.xyz/v1",
// }

const Aptos_Devnet: Chain = {
  id: "aptos:devnet",
  name: "Movement Aptos Devnet",
  rpcUrl: "https://aptos.devnet.m1.movementlabs.xyz",
}

const SupportedChains: Chain[] = [
  // movement_Suzuka,
  movement_porto,
  Aptos_Devnet,
  // Aptos_testnet,
]

export function AptosProviders({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletProvider chains={SupportedChains}>
      {children}
    </AptosWalletProvider>
  )
}
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" showRecentTransactions={true}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
