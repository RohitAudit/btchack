"use client"
import * as React from "react"
import Box from "@mui/material/Box"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Image from "next/image"
import nETHIcon from "/public/Icons/tokens/nETH.png"
import Divider from "@mui/material/Divider"
// import { useStepperContext } from "@mui/material/Stepper"
import { useStepper } from "@/Hooks/StepperContext"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch, resetStore } from "@/store"

const steps = [
  {
    label: "Approve stETH token spending",
  },
  {
    label: "Sign deposit Tx",
  },
  {
    label: "Tx confirming...",
  },
]
interface VerticalLinearStepperProps {
  onStepChange: (step: number) => void
  bridgeFee: string
  inputValue: string
  nETH_Value: string
}

export function VerticalLinearStepper({
  onStepChange,
  bridgeFee,
  inputValue,
  nETH_Value,
}: VerticalLinearStepperProps) {
  const { activeStep } = useStepper()
  const selectedToken = useSelector((state: RootState) => state.selectedToken)

  return (
    <Box
      sx={{
        maxWidth: 400,
        width: "40rem",
        backgroundColor: "#F7F8F8",
        backdropFilter: "64px",
        borderRadius: "1rem",
        color: "black",
        zIndex: "10",
        padding: "1rem 1rem",
      }}
    >
      <div className=" flex flex-col space-y-4  ">
        <div className=" rounded-xl bg-gray-200 px-4 py-4">
          <h1>Send</h1>

          <div className="flex justify-between items-center ">
            <h1 className="text-3xl font-semibold">
              {inputValue} {selectedToken.symbol}
            </h1>
            <Image
              src={selectedToken.logo}
              width={40}
              height={40}
              className=""
              alt="Source Token image"
            />
          </div>
        </div>

        <div className=" rounded-xl bg-gray-200 px-4 py-4">
          <h1>Recieve</h1>

          <div className="flex justify-between items-center ">
            <h1 className="text-3xl font-semibold">{nETH_Value} nETH</h1>
            <Image
              src={nETHIcon}
              width={35}
              height={35}
              className=""
              alt="destination Token image"
            />
          </div>
          <div className="flex    justify-end items-center ">
            {/* <h1 className=" text-xs mt-4 text-gray-400">
              Bridge Fee : {bridgeFee} ETH
            </h1> */}
          </div>
        </div>
      </div>

      <Divider sx={{ border: "1px solid #6b7280", my: "1rem" }} />
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              sx={{
                ".MuiStepLabel-label.Mui-completed": {
                  color: "#068ef3", // Color when active
                },
                ".MuiStepLabel-label.Mui-active": {
                  color: "#068ef3", // Color when active
                },
              }}
            >
              {index === 0 && (
                <>{`Approve ${selectedToken.symbol} token spending`}</>
              )}

              {index === 1 && <>{`Sign deposit tx`}</>}

              {index === 2 && <>{step.label}</>}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
