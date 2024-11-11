"use client"
import React, { useEffect } from "react"
// import bgImage from "/public/Images/linearBG.jpeg"
import bgImage from "/public/Images/background.jpeg"
import Ellipse1 from "/public/Images/Ellipse1.svg"
import Ellipse2 from "/public/Images/Ellipse2.svg"
import Image from "next/image"
import TokenBridge from "@/components/TokenBridge/TokenBridgeMain"
import { StepperProvider } from "@/Hooks/StepperContext"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Suspense } from "react"

const Home = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentNetwork = searchParams.get("network")

  useEffect(() => {
    if (currentNetwork === null) {
      router.push(`?network=fractal`)
    }
  }, [searchParams])

  return (
    <Suspense>
      <StepperProvider>
        <div className={` w-full h-full px-2 relative overflow-clip `}>
          <div className="  z-30 w-[35vw] h-[25vw] border-white absolute bottom-0 overflow-hidden left-2 rounded-3xl">
            <Image
              src={Ellipse1}
              alt="Ellipse image"
              className=" w-[25vw] h-[25vw]    xl:-bottom-[15rem]  z-10 absolute -bottom-[5rem] -left-[4rem] rounded-full "
            />
          </div>

          <div className="    z-30 w-[35vw] h-[25vw] border-white absolute top-0 overflow-hidden right-2 rounded-3xl">
            <Image
              src={Ellipse2}
              alt="Ellipse image"
              className=" w-[25vw] h-[25vw]   xl:-top-[15rem]  z-10 absolute -top-[5rem] -right-[4rem] rounded-full "
            />
          </div>

          <Image
            src={bgImage}
            alt="background image"
            className="rounded-3xl max-h-[88vh]  max-w-[99vw]   object-cover w-full h-full -z-10 absolute "
          />
          <TokenBridge />
        </div>
      </StepperProvider>
    </Suspense>
  )
}

export default Home
