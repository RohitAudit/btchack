import React from "react"
import { CustomConnectButton } from "@/components/ui/WalletButton"
import Image from "next/image"
import ethIcon from "/public/Icons/eth5.png"
const Header = () => {
  return (
    <div className="pt-5 pb-3  px-4 rounded-t-3xl flex w-full justify-between items-center text-slate-700  font-light text-xs  bg-[#F7F7F8]/[.15] ">
      <div className="flex items-center">
        <h1>FROM </h1>
        <Image
          src={ethIcon}
          width={13}
          height={13}
          alt="Movement Icon"
          className=" ml-3 mr-2 -mt-[2px]"
        />

        <h1> ETHEREUM </h1>
      </div>
      <CustomConnectButton custom={true} network={true} />
    </div>
  )
}

export default Header
