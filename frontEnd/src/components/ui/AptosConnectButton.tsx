"use client"
import React from "react"
import movementIcon from "/public/Icons/movement.svg"
import Image from "next/image"
import { AptosConnectButton } from "@razorlabs/wallet-kit"
import Tippy from "@tippyjs/react"
import "tippy.js/animations/scale.css"
import "tippy.js/themes/translucent.css"
import { WalletName, useWallet } from "@aptos-labs/wallet-adapter-react"

const AptosButton = () => {
  return (
    <AptosConnectButton
      style={{
        width: "fit-content",
        height: "fit-content",
        padding: 0,
        margin: 0,
      }}
    >
      <Tippy
        content={`Connect Movement Wallet`}
        placement="top"
        animateFill={true}
        animation={"scale"}
        theme="translucent"
      >
        <div className="flex items-center px-4 py-1 border border-slate-950/25 w-fit rounded-3xl  space-x-2 text-slate-950">
          <Image src={movementIcon} width={20} height={20} alt="movementIcon" />
          <h1 className={` font-light text-xs `}>Connect</h1>
        </div>
      </Tippy>
    </AptosConnectButton>
  )
}

export default AptosButton

export const WalletConnectDemo = () => {
  const { connect, disconnect, account, connected } = useWallet()

  const handleConnect = async () => {
    try {
      // Change below to the desired wallet name instead of "Petra"
      await connect("Petra" as WalletName<"Petra">)
      console.log("Connected to wallet:", account)
    } catch (error) {
      console.error("Failed to connect to wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      console.log("Disconnected from wallet")
    } catch (error) {
      console.error("Failed to disconnect from wallet:", error)
    }
  }

  return (
    <div>
      <h1>Aptos Wallet Connection</h1>
      <div>
        {connected ? (
          <div>
            <p>Connected to: {account?.address}</p>
            <button onClick={handleDisconnect}>Disconnect</button>
          </div>
        ) : (
          <button onClick={handleConnect}>Connect Wallet</button>
        )}
      </div>
    </div>
  )
}
