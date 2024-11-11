import React, { useEffect, useRef, useState } from "react"

import { Button, Card, CollapseProps, Input, Radio, message } from "antd"
import Link from "next/link"

import useMessage from "antd/es/message/useMessage"
import Image from "next/image"
import uniSatLogo from "/public/Icons/uniSatLogo.png"

enum ChainType {
  BITCOIN_MAINNET = "BITCOIN_MAINNET",
  BITCOIN_TESTNET = "BITCOIN_TESTNET",
  BITCOIN_TESTNET4 = "BITCOIN_TESTNET4",
  BITCOIN_SIGNET = "BITCOIN_SIGNET",
  FRACTAL_BITCOIN_MAINNET = "FRACTAL_BITCOIN_MAINNET",
  FRACTAL_BITCOIN_TESTNET = "FRACTAL_BITCOIN_TESTNET",
}

enum NetworkType {
  MAINNET,
  TESTNET,
}

type TypeChain = {
  enum: ChainType
  label: string
  icon: string
  unit: string
  networkType: NetworkType
  endpoints: string[]
  mempoolSpaceUrl: string
  unisatUrl: string
  ordinalsUrl: string
}

const CHAINS_MAP: { [key: string]: TypeChain } = {
  [ChainType.BITCOIN_MAINNET]: {
    enum: ChainType.BITCOIN_MAINNET,
    label: "Bitcoin Mainnet",
    icon: "./images/artifacts/bitcoin-mainnet.png",
    unit: "BTC",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space",
    unisatUrl: "https://unisat.io",
    ordinalsUrl: "https://ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET]: {
    enum: ChainType.BITCOIN_TESTNET,
    label: "Bitcoin Testnet",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet",
    unisatUrl: "https://testnet.unisat.io",
    ordinalsUrl: "https://testnet.ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET4]: {
    enum: ChainType.BITCOIN_TESTNET4,
    label: "Bitcoin Testnet4 (Beta)",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet4.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet4",
    unisatUrl: "https://testnet4.unisat.io",
    ordinalsUrl: "https://testnet4.ordinals.com",
  },
  [ChainType.BITCOIN_SIGNET]: {
    enum: ChainType.BITCOIN_SIGNET,
    label: "Bitcoin Signet",
    icon: "./images/artifacts/bitcoin-signet.svg",
    unit: "sBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-signet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/signet",
    unisatUrl: "https://signet.unisat.io",
    ordinalsUrl: "https://signet.ordinals.com",
  },
  [ChainType.FRACTAL_BITCOIN_MAINNET]: {
    enum: ChainType.FRACTAL_BITCOIN_MAINNET,
    label: "Fractal Bitcoin Mainnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "FB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io"],
    mempoolSpaceUrl: "https://mempool.fractalbitcoin.io",
    unisatUrl: "https://fractal.unisat.io",
    ordinalsUrl: "https://ordinals.fractalbitcoin.io",
  },
  [ChainType.FRACTAL_BITCOIN_TESTNET]: {
    enum: ChainType.FRACTAL_BITCOIN_TESTNET,
    label: "Fractal Bitcoin Testnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "tFB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io/testnet"],
    mempoolSpaceUrl: "https://mempool-testnet.fractalbitcoin.io",
    unisatUrl: "https://fractal-testnet.unisat.io",
    ordinalsUrl: "https://ordinals-testnet.fractalbitcoin.io",
  },
}

const UniSatWallet = ({ onStateChange }: { onStateChange: any }) => {
  const [unisatInstalled, setUnisatInstalled] = useState(false)
  const [connected, setConnected] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [publicKey, setPublicKey] = useState("")
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  })
  const [network, setNetwork] = useState("livenet")

  const [version, setVersion] = useState("")

  const [chainType, setChainType] = useState<ChainType>(
    ChainType.BITCOIN_MAINNET
  )

  const chain = CHAINS_MAP[chainType]
  useEffect(() => {
    onStateChange({
      unisatInstalled,
      connected,
      accounts,
      publicKey,
      address,
      balance,
      network,
      version,
    })
  }, [
    unisatInstalled,
    connected,
    accounts,
    publicKey,
    address,
    balance,
    network,
    version,
  ])
  const getBasicInfo = async () => {
    const unisat = (window as any).unisat

    try {
      const accounts = await unisat.getAccounts()
      setAccounts(accounts)
    } catch (e) {
      console.log("getAccounts error", e)
    }

    try {
      const publicKey = await unisat.getPublicKey()
      setPublicKey(publicKey)
    } catch (e) {
      console.log("getPublicKey error", e)
    }

    try {
      const balance = await unisat.getBalance()
      setBalance(balance)
    } catch (e) {
      console.log("getBalance error", e)
    }

    try {
      const chain = await unisat.getChain()
      setChainType(chain.enum)
    } catch (e) {
      console.log("getChain error", e)
    }

    try {
      const network = await unisat.getNetwork()
      setNetwork(network)
    } catch (e) {
      console.log("getNetwork error", e)
    }

    try {
      const version = await unisat.getVersion()
      setVersion(version)
    } catch (e) {
      console.log("getVersion error ", e)
    }

    if (unisat.getChain !== undefined) {
      try {
        const chain = await unisat.getChain()
        setChainType(chain.enum)
      } catch (e) {
        console.log("getChain error", e)
      }
    }
  }

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: [],
  })
  const self = selfRef.current
  const handleAccountsChanged = (_accounts: string[]) => {
    console.log("accounts changed", _accounts)
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return
    }
    self.accounts = _accounts
    if (_accounts.length > 0) {
      setAccounts(_accounts)
      setConnected(true)
      setAddress(_accounts[0])
      getBasicInfo()
    } else {
      setConnected(false)
    }
  }

  const handleNetworkChanged = (network: string) => {
    console.log("network changed", network)
    setNetwork(network)
    getBasicInfo()
  }

  const handleChainChanged = (chain: {
    enum: ChainType
    name: string
    network: string
  }) => {
    console.log("chain changed", chain)
    setChainType(chain.enum)
    getBasicInfo()
  }

  useEffect(() => {
    async function checkUnisat() {
      let unisat = (window as any).unisat

      for (let i = 1; i < 10 && !unisat; i += 1) {
        await new Promise(resolve => setTimeout(resolve, 100 * i))
        unisat = (window as any).unisat
      }

      if (unisat) {
        setUnisatInstalled(true)
      } else if (!unisat) return

      unisat
        .getAccounts()
        .then((accounts: string[]) => {
          handleAccountsChanged(accounts)
        })
        .catch((e: any) => {
          messageApi.error((e as any).message)
        })

      unisat.on("accountsChanged", handleAccountsChanged)
      unisat.on("networkChanged", handleNetworkChanged)
      unisat.on("chainChanged", handleChainChanged)

      return () => {
        unisat.removeListener("accountsChanged", handleAccountsChanged)
        unisat.removeListener("networkChanged", handleNetworkChanged)
        unisat.removeListener("chainChanged", handleChainChanged)
      }
    }

    checkUnisat().then()
  }, [])

  const [messageApi, contextHolder] = useMessage()

  if (!unisatInstalled) {
    return (
      <div className="App">
        <header>
          <div>
            <Link
              href={"https://unisat.io"}
              target="_blank"
              className="flex text-xs items-center hover:bg-[#020617]/[0.1] px-4 py-1 border  border-slate-950/25 w-fit rounded-3xl  space-x-3 text-slate-950 bg-transparent transition-colors duration-300 ease-in-out"
            >
              Install Unisat Wallet
            </Link>
          </div>
        </header>
      </div>
    )
  }

  const unisat = (window as any).unisat

  const chains = Object.keys(CHAINS_MAP).map(key => {
    const chain = CHAINS_MAP[key as ChainType]
    return {
      label: chain.label,
      value: chain.enum,
    }
  })

  const supportLegacyNetworks = ["livenet", "testnet"]
  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "90%",
            alignSelf: "center",
          }}
        >
          <div style={{ minWidth: 200 }}>
            {connected ? (
              <button
                onClick={async () => {
                  await unisat.disconnect()
                }}
                className="flex text-xs items-center hover:bg-[#020617]/[0.1] px-4 py-1 border  border-slate-950/25 w-fit rounded-3xl  space-x-3 text-slate-950 bg-transparent transition-colors duration-300 ease-in-out"
              >
                <div className="relative">
                  <div className="bg-black rounded-full absolute h-[15px] w-[15px] top-0 -z-10" />
                  <Image
                    src={uniSatLogo}
                    width={15}
                    height={15}
                    alt="uniSatLogo"
                    className="z-10 mr-1"
                  />
                </div>
                Disconnect
              </button>
            ) : null}
          </div>
        </div>

        {connected ? (
          <></>
        ) : (
          <div>
            <button
              className="flex text-xs items-center hover:bg-[#020617]/[0.1] px-4 py-1 border  border-slate-950/25 w-fit rounded-3xl  space-x-3 text-slate-950 bg-transparent transition-colors duration-300 ease-in-out"
              onClick={async () => {
                try {
                  const result = await unisat.requestAccounts()
                  handleAccountsChanged(result)
                } catch (e) {
                  messageApi.error((e as any).message)
                }
              }}
            >
              <div className="relative">
                <div className="bg-black rounded-full absolute h-[15px] w-[15px] top-0 -z-10" />
                <Image
                  src={uniSatLogo}
                  width={15}
                  height={15}
                  alt="uniSatLogo"
                  className="z-10 mr-1"
                />
              </div>
              Connect
            </button>
          </div>
        )}
      </header>
    </div>
  )
}

export default UniSatWallet
