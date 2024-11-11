"use client"

import Link from "next/link"
import React from "react"
import { CustomConnectButton } from "./ui/WalletButton"
import logo from "/public/logo.svg"
import Image from "next/image"
import { instrumentSerifFont, instrumentSansFont } from "@/app/fonts"
import { useAccount } from "wagmi"
import { usePathname, useSearchParams } from "next/navigation"

import { Box, Toolbar, IconButton, Menu, Button, MenuItem } from "@mui/material"

import MenuIcon from "@mui/icons-material/Menu"

const Navbar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentNetwork = searchParams.get("network")
  const { isConnected } = useAccount()
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <>
      <div className="  flex  w-full z-10 bg-[#F7F8F8]  items-center justify-between px-8 pt-3 pb-2 text-sm text-gray-500  overflow-hidden">
        <div className=" ">
          <Link href={`/`}>
            <Image
              src={logo}
              alt="Logo"
              width={100}
              height={100}
              className=" -mt-2"
            />
          </Link>
        </div>

        <div
          className={` ${
            isConnected ? "lg:ml-[12rem] ml-0" : "ml-0"
          } sm:flex flex-grow items-center justify-center `}
        >
          <div
            className={`${instrumentSansFont.className} transition-all duration-300 ease-in-out  flex w-fit lg:space-x-8 space-x-4   text-gray-600 `}
          ></div>
        </div>
        <div className=" flex-grow-0">
          <CustomConnectButton network={true} />
        </div>
      </div>
    </>
  )
}

export default Navbar
