import React from "react"
import Tippy from "@tippyjs/react"
import "tippy.js/animations/scale.css"
import "tippy.js/themes/translucent.css"
import { CircularProgress } from "@mui/material"

import { WalletName, useWallet } from "@aptos-labs/wallet-adapter-react"
export const DepositButton = ({
  handleClick = () => {},
  isConnected,
  destinationChain,
  transferring,
  uniSat,
}: {
  handleClick?: any
  transferring: boolean
  isConnected: boolean
  destinationChain: string
  uniSat: boolean
}) => {
  return (
    <Tippy
      placement="top"
      animateFill={true}
      animation={"scale"}
      theme="translucent"
      content={
        isConnected
          ? `Deposit to ${destinationChain}`
          : " Please connect wallet"
      }
    >
      <button
        className="duration-300 transition-colors  ease-in-out   rounded-3xl text-center  w-full  py-2 text-sm mt-4"
        onClick={handleClick}
        style={{
          color: isConnected && uniSat ? "#3c3c3b" : "white",
          backgroundColor:
            isConnected && uniSat ? "#FFF1C0" : "rgb(60 60 59 / 0.6)",
          cursor:
            isConnected && uniSat && transferring === false
              ? "pointer"
              : "not-allowed",
        }}
      >
        {transferring ? (
          <div className="flex items-center justify-center space-x-3">
            <h1>Transferring </h1>
            <CircularProgress sx={{ color: "black" }} size={20} />
          </div>
        ) : (
          <> Deposit Amount</>
        )}
      </button>
    </Tippy>
  )
}
