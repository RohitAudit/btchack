"use client"
import React from "react"
import nETHIcon from "/public/Icons/tokens/nETH.png"

import Image from "next/image"
import { useState } from "react"
import { StaticImageData } from "next/image"
import { CircularProgress } from "@mui/material"

import ethIcon from "/public/Icons/eth.png"

import fractalLogo from "/public/Icons/fractal-logo1.png"
import roochLogo from "/public/Icons/rooch_logo.svg"

import { ChainPopover } from "../ui/Popover"

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { setSelectedChain } from "@/store/selectedChainSlice"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store"
import { useSearchParams, useRouter } from "next/navigation"

interface DestinationContainerProps {
  value: string
  loading: boolean
  nETH_balance: string
  nETHBalanceLoading: boolean
}
const DestinationContainer = ({
  nETH_balance,
  value,
  loading,
  nETHBalanceLoading,
}: DestinationContainerProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentNetwork = searchParams.get("network")
  console.log("currentNetwork", currentNetwork)

  const dispatch = useDispatch<AppDispatch>()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleChainClick = (
    chainData: {
      name: string
      icon: StaticImageData
      destinationID: number
      wallet: true
      chainID: number
    },
    close: () => void
  ) => {
    console.log("chainData selected", chainData)
    dispatch(setSelectedChain(chainData))

    router.push(`?network=${chainData.name}`)

    close()
  }
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  return (
    <div className="mb-4 font-light text-xs text-slate-700/75 pt-4 pb-4  px-4 rounded-3xl mt-[1px]  space-y-8  flex flex-col w-full  justify-between items-center   bg-[#F7F7F8]/[.15]  ">
      <div className="flex justify-between items-center w-full   ">
        <ChainPopover
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          open={open}
          handleClick={handleChainClick}
        />
        <div className="flex items-center">
          <h1>TO</h1>

          <div
            className="flex items-center border border-transparent rounded-3xl ml-2 px-2 py-1 hover:bg-[#f7f7f8]/[.17] hover:border-slate-950/25 transition-colors duration-300 ease-in-out"
            onClick={handlePopoverOpen}
          >
            <ArrowDropDownIcon
              sx={{ fontSize: 20 }}
              className={`transition-transform duration-300 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />

            {currentNetwork === "fractal" && (
              <>
                <Image
                  src={fractalLogo}
                  width={20}
                  height={20}
                  alt={`fractalLogo `}
                  className="ml-1"
                />
                <h1 className={`ml-2  uppercase`}>Fractal</h1>
              </>
            )}

            {currentNetwork === "rooch" && (
              <>
                <Image
                  src={roochLogo}
                  width={20}
                  height={20}
                  alt={`roochLogo `}
                  className="ml-1 max-h-[20px] max-w-[20px]"
                />
                <h1 className={`ml-2  uppercase`}>Rooch</h1>
              </>
            )}

            {currentNetwork === null && (
              <>
                <Image
                  src={ethIcon}
                  width={20}
                  height={20}
                  alt={`Unkown Icon `}
                  className="ml-1"
                />
                <h1 className={`ml-2  uppercase`}>Unkown</h1>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center ">
          {nETHBalanceLoading ? (
            <>
              <h1 className="mr-1">Balance : </h1>
              <CircularProgress
                size={10}
                sx={{
                  color: "black",
                }}
              />
            </>
          ) : (
            <>
              <h1>Balance : {parseFloat(nETH_balance).toFixed(8)} nativeETH</h1>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between  items-end w-full">
        <div className="flex flex-col items-start min-h-[52px]">
          <h1>You Recieve</h1>

          {loading ? (
            <h1 className="text-2xl">...</h1>
          ) : (
            <h1 className={`text-3xl`}>{value ? value : "0"}</h1>
          )}
        </div>

        <div className="flex items-center h-8 pr-2 ">
          <Image
            src={nETHIcon}
            width={20}
            height={20}
            alt="nEth Icon"
            className="mr-[6px]"
          />
          <h1>nativeETH</h1>
        </div>
      </div>
    </div>
  )
}

export default DestinationContainer
