import React, { createContext, useContext, useState, ReactNode } from "react"

interface StepperContextType {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const StepperContext = createContext<StepperContextType | undefined>(undefined)
export const StepperProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <StepperContext.Provider value={{ activeStep, setActiveStep }}>
      {children}
    </StepperContext.Provider>
  )
}

export const useStepper = (): StepperContextType => {
  const context = useContext(StepperContext)
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider")
  }
  return context
}
