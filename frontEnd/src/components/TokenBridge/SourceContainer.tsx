"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import ethIcon from "/public/Icons/ethIcon.svg"
import { StaticImageData } from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { setSelectedToken } from "@/store/selectedTokenslice"
import { RootState } from "@/store"
import { useAccount } from "wagmi"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import "tippy.js/animations/scale.css"
import "tippy.js/themes/translucent.css"
import { CircularProgress } from "@mui/material"
interface SourceContainerProps {
  value: string
  setValue: any
  setnETH: any
  handleChange: (e: any) => void
  EthereumBalanceLoading: boolean
}
const SourceContainer = ({
  value,
  setValue,
  setnETH,
  EthereumBalanceLoading,
  handleChange,
}: SourceContainerProps) => {
  const dispatch = useDispatch()
  const selectedToken = useSelector((state: RootState) => state.selectedToken)
  const inputRef = useRef<HTMLInputElement>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { isConnected } = useAccount()

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const handleMax = () => {
    const maxBalance = parseFloat(selectedToken.balance) - 0.001
    setValue(maxBalance.toFixed(3).toString())
    setnETH(maxBalance.toFixed(3).toString())
  }

  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isConnected])

  const handleTokenClick = (
    token: {
      name: string
      symbol: string
      logo: StaticImageData
      native: boolean
      tokenAddress?: string
      balance: string
    },
    close: () => void
  ) => {
    console.log("tokens selected", token)
    dispatch(setSelectedToken(token))
    console.log("anchorEl", anchorEl)
    close()
  }
  const open = Boolean(anchorEl)

  return (
    <div className="font-light text-xs text-slate-950/75  pt-4 pb-4 px-4 rounded-b-3xl space-y-4  flex flex-col w-full  justify-between items-center text-slate-700 bg-[#F7F7F8]/[.15]  ">
      <div className="flex justify-between items-center w-full  pr-2 ">
        <div className="flex items-center">
          <Image
            src={ethIcon}
            width={23}
            height={23}
            alt="Eth Icon"
            className="mr-2  "
          />
          <h1>ETH</h1>
        </div>

        <div className="flex items-center">
          {EthereumBalanceLoading && isConnected ? (
            <>
              <h1>Balance :</h1>
              <CircularProgress
                size={10}
                sx={{
                  color: "black",
                }}
              />
            </>
          ) : (
            <>
              <h1>Balance : {selectedToken.balance} ETH</h1>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <input
          type="number"
          step="0.0000001"
          ref={inputRef}
          value={value}
          placeholder="0"
          className="text-3xl appearance-none border placeholder:text-slate-700 bg-transparent border-none rounded  py-2 focus:outline-none w-64"
          onChange={handleChange}
          min="0"
        />
        <Tippy
          content={`input max balance`}
          placement="top"
          animateFill={true}
          animation={"scale"}
          theme="translucent"
        >
          <button
            onClick={handleMax}
            className=" px-4 py-2 border border-slate-950/25 rounded-3xl text-xs   -ml-4  hover:bg-[#020617]/[0.1] hover:border-slate-950/25 transition-colors duration-300 ease-in-out"
          >
            Max
          </button>
        </Tippy>
      </div>
    </div>
  )
}

export default SourceContainer
