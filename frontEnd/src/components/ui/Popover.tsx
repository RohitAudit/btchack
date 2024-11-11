"use client"

import React from "react"
import Popover from "@mui/material/Popover"
import Typography from "@mui/material/Typography"
import Image from "next/image"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { TokenType } from "@/types"
import Backdrop from "@mui/material/Backdrop"
import { VerticalLinearStepper } from "./Stepper"
import { DestinationChains } from "@/constant/constants"

import berachainIcon from "/public/Icons/Berachain_White.png"
import MovementIcon from "/public/Icons/movementIcon.png"
import Link from "next/link"

interface TokensPopoverProps {
  open: boolean
  anchorEl: null | HTMLElement
  handlePopoverClose: any
  handleClick: any
}

const TokensPopover = ({
  open,
  anchorEl,
  handleClick,
  handlePopoverClose,
}: TokensPopoverProps) => {
  const selectedNetwork = useSelector(
    (state: RootState) => state.selectedNetwork
  )

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        style: {
          borderRadius: "25px",
          width: "400px",
          background: "rgba(51, 51, 51, 0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
        },
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, rgba(45,45,45,0.3) 0%, rgba(30,30,30,0.3) 100%)",
        }}
        className="text-white p-1 shadow-lg rounded-3xl"
      >
        <div>
          <div className="flex items-center justify-center mb-4">
            <Typography variant="h6" className="text-white">
              Select Tokens
            </Typography>
          </div>
          {selectedNetwork.tokens.map((token: TokenType, tokenIndex: any) => (
            <div
              key={tokenIndex}
              onClick={() => handleClick(token, handlePopoverClose)}
              className={`flex justify-between items-center p-3 hover:bg-[#5555558d] hover:border hover:border-orange-500 rounded-xl cursor-pointer transition-colors duration-200`}
              style={{ border: "1px solid transparent" }} // Initial border is transparent
            >
              <div className="flex items-center">
                <Image
                  src={token.logo}
                  width={40}
                  height={40}
                  alt={`${token.name} Icon`}
                />
                <div className="ml-4">
                  <Typography variant="body2" className="text-sm">
                    {token.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-xs text-gray-400"
                  >
                    {token.symbol}
                  </Typography>
                </div>
              </div>
              <Typography variant="body2" className="text-sm">
                {token.balance} {token.symbol}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </Popover>
  )
}

export default TokensPopover

export function TransactionPopUp({
  open,
  onStepChange,
  bridgeFee,
  inputValue,
  nETH_Value,
}: {
  open: boolean
  onStepChange: (step: number) => void
  bridgeFee: string
  inputValue: string
  nETH_Value: string
}) {
  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <VerticalLinearStepper
          onStepChange={onStepChange}
          bridgeFee={bridgeFee}
          inputValue={inputValue}
          nETH_Value={nETH_Value}
        />
      </Backdrop>
    </div>
  )
}

export const ChainPopover = ({
  open,
  anchorEl,
  handleClick,
  handlePopoverClose,
}: TokensPopoverProps) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        style: {
          borderRadius: "25px",
          width: "180px",
          background: "rgba(51, 51, 51, 0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
        },
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderRadius: "25px",
          background:
            "linear-gradient(135deg, rgba(45,45,45,0.3) 0%, rgba(30,30,30,0.3) 100%)",
        }}
        className="text-white p-1 shadow-lg rounded-3xl"
      >
        <div>
          <div className="flex items-center justify-center mb-4">
            <Typography variant="h6" className="text-white">
              Select Chain
            </Typography>
          </div>
          {DestinationChains.map((chainData, index) => (
            <div
              key={index}
              onClick={() => handleClick(chainData, handlePopoverClose)}
              className={`flex justify-center items-center p-3 hover:bg-[#5555558d] hover:border hover:border-orange-500 rounded-xl cursor-pointer transition-colors duration-200`}
              style={{ border: "1px solid transparent" }}
            >
              <div className="flex items-center">
                <Image
                  src={chainData.icon}
                  width={30}
                  height={30}
                  alt={`${chainData.name} Icon`}
                  className=" rounded-full max-h-[30px] max-w-[30px]"
                />
                <div className="ml-2 items-center flex">
                  <Typography
                    variant="body2"
                    className="text-sm text-gray-200 capitalize"
                  >
                    {chainData.name}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Popover>
  )
}
export function StartingPopover({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: any
}) {
  return (
    <div>
      <Backdrop
        sx={theme => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={open}
        onClick={() => {
          // setOpen(false)
        }}
      >
        <div className="w-[27rem] text-black bg-[#FFF1C0] flex flex-col py-10 px-8 justify-center rounded-lg">
          <h1 className=" font-semibold text-center text-xl mb-8">
            Select your Raga
          </h1>

          <div className="flex justify-between">
            <Link
              className="bg-black px-5 py-3 flex items-center space-x-2  text-white hover:scale-105 transition-all duration-300 ease-in-out"
              title="Berachain as destination"
              href={`?network=berachain`}
              onClick={() => {
                setOpen(false)
              }}
            >
              <Image
                src={berachainIcon}
                width={40}
                height={40}
                alt={`berachainIcon `}
              />
              <h1 className="font-semibold">Berachain</h1>
            </Link>

            <Link
              className="bg-[#FBBF24] px-5 py-3 flex items-center space-x-2 hover:scale-105 transition-all duration-300 ease-in-out"
              title="Movement as destination"
              href={`?network=movement`}
              onClick={() => {
                setOpen(false)
              }}
            >
              <Image
                src={MovementIcon}
                width={25}
                height={25}
                alt={`MovementIcon `}
              />
              <h1 className="font-semibold text-black">Movement</h1>
            </Link>
          </div>
        </div>
      </Backdrop>
    </div>
  )
}
