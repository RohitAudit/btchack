"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"
import ethIcon from "/public/Icons/ethIcon.svg"
import Tippy from "@tippyjs/react"
import "tippy.js/animations/scale.css"
import "tippy.js/themes/translucent.css"
import { useSwitchChain } from "wagmi"
interface CustomConnectButtonProps {
  style?: number
  custom?: boolean
  network: boolean
}
export const CustomConnectButton = ({
  style,
  custom = false,
  network,
}: CustomConnectButtonProps) => {
  const { chains, switchChain } = useSwitchChain()
  const switchHolesky = () => {}

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <>
                    {custom ? (
                      <>
                        <Tippy
                          content={`Connect Source Wallet`}
                          placement="top"
                          animateFill={true}
                          animation={"scale"}
                          theme="translucent"
                        >
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="hover:bg-[#020617]/[0.1] transition-colors duration-300 ease-in-out text-slate-700 border border-slate-950/25 rounded-3xl px-4 py-1   flex items-center"
                          >
                            <Image
                              src={ethIcon}
                              width={20}
                              height={20}
                              alt="Eth Icon"
                              className="mr-[0.3rem]  "
                            />

                            <span className=" font-light text-xs   text-slate-700 ">
                              Connect{" "}
                            </span>
                          </button>
                        </Tippy>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className=" text-gray-400 border border-gray-200 rounded-3xl px-4 py-2 flex items-center hover:bg-[#020617]/[0.1] transition-colors duration-300 ease-in-out"
                        >
                          <Image
                            src={ethIcon}
                            width={25}
                            height={25}
                            alt="Eth Icon"
                            className="mr-2"
                          />

                          <span className=" font-semibold">Connect </span>
                        </button>
                      </>
                    )}
                  </>
                )
              }
              if (chain.unsupported) {
                return (
                  <>
                    <button
                      onClick={() => switchChain({ chainId: 17000 })}
                      type="button"
                      className="hover:bg-red-500/[0.15]  transition-colors duration-300 ease-in-out text-red-500 border border-red-500 rounded-3xl px-4 py-1 flex items-center ml-28"
                    >
                      Wrong network
                    </button>

                    {/* {custom ? (
                      <>
                        <button
                          onClick={() => switchChain({ chainId: 17000 })}
                          type="button"
                          className="hover:bg-red-500/[0.15]  transition-colors duration-300 ease-in-out text-blue-500 border border-blue-500 rounded-3xl px-4 py-1 flex items-center ml-28"
                        >
                          Switch Network
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="hover:bg-red-500/[0.15]  transition-colors duration-300 ease-in-out text-red-500 border border-red-500 rounded-3xl px-4 py-1 flex items-center ml-28"
                        >
                          Wrong network
                        </button>
                      </>
                    )} */}
                  </>
                )
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  {custom ? (
                    <div className="flex items-center space-x-2">
                      <h1 className={` font-light text-xs `}>Connected</h1>
                      <div className="h-2 w-2 rounded-full bg-green-700" />
                    </div>
                  ) : (
                    <>
                      {network ? (
                        <>
                          <button
                            onClick={openChainModal}
                            style={{ display: "flex", alignItems: "center" }}
                            type="button"
                            className="hover:bg-[#020617]/[0.1] transition-colors duration-300 ease-in-out text-slate-700 border border-slate-950/25 rounded-3xl px-4 py-[0.3rem]   flex items-center"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 18,
                                  height: 18,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    width={18}
                                    height={18}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </button>
                        </>
                      ) : (
                        <></>
                      )}

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="hover:bg-[#020617]/[0.1] transition-colors duration-300 ease-in-out text-slate-700 border border-slate-950/25 rounded-3xl px-4 py-[0.3rem]   flex items-center"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ""}
                      </button>
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
