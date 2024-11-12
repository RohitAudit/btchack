"use client"

import React from "react"
import { useState, useEffect } from "react"
import SouthIcon from "@mui/icons-material/South"
import Header from "./Header"
import SourceContainer from "./SourceContainer"
import DestinationContainer from "./DestinationContainer"
import AptosButton from "../ui/AptosConnectButton"
import { DepositButton } from "../ui/DepositButton"
import {
  DepositERC,
  DepositETH,
  CalculateLayerZeroFees,
  fetch_ERC20Balance,
  get_nETH_rate,
} from "@/util/Contract/ContractFunctions"
import { useBalance, useAccount } from "wagmi"
import { config } from "@/util/wallet/wagmi"
import { toast } from "react-toastify"
import { parseEther, formatUnits } from "viem"
import {
  contractAddressesList,
  DestinationChainsMapping,
  networkRPC,
} from "@/constant/constants"
import WETH_ABI from "@/util/Contract/Abi/Holesky/WETH.json"
import { setTokenBalance } from "@/store/selectednetworkslice"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/store"
import { resetStore } from "@/store"
import { setSelectedTokenBalance } from "@/store/selectedTokenslice"
import { TransactionPopUp } from "../ui/Popover"
import { useStepper } from "@/Hooks/StepperContext"
import { useSwitchChain, type UseSwitchChainReturnType } from "wagmi"
import { setTransferring } from "@/store/transferSlice"
import { bridgeFeeType } from "@/types"

import { set_nETH_Rate, set_nETH_Balance } from "@/store/balanceslice"
// import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design"
import { WalletConnectDemo } from "../ui/AptosConnectButton"
import { WalletSelector } from "@/components/Wallet/Aptos-shadcn"
import { WalletName, useWallet } from "@aptos-labs/wallet-adapter-react"
import { main } from "@/util/Contract/MovementFunctions"
import { useSearchParams } from "next/navigation"
import {
  RoochClient,
  getRoochNodeUrl,
  BitcoinAddress,
  RoochAddress,
} from "@roochnetwork/rooch-sdk"
import UniSatWallet from "../Wallet/uniSatWallet"
type setnETHFormula = {
  BASE_POINT: number
  sharePrice: number
}
const TokenBridge = () => {
  const [unisatState, setUnisatState] = useState({
    unisatInstalled: false,
    connected: false,
    accounts: [],
    publicKey: "",
    address: "",
    balance: { confirmed: 0, unconfirmed: 0, total: 0 },
    network: "livenet",
    version: "",
  })

  const handleUniSatStateChange = (newState: any) => {
    setUnisatState(prevState => ({ ...prevState, ...newState }))
  }

  const { setActiveStep } = useStepper()
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const currentNetwork = searchParams.get("network") || "unkown"

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string>("")
  const [nETHFormula, setnETHFormula] = useState<setnETHFormula>({
    BASE_POINT: 0,
    sharePrice: 0,
  })
  const [nETHRate, setnETHRate] = useState<string>("")
  const [nETHLoading, setnETHLoading] = useState<boolean>(false)
  const [EthereumBalanceLoading, setEthereumBalanceLoading] =
    useState<boolean>(false)
  const [nETHBalanceLoading, setnETHBalanceLoading] = useState<boolean>(false)
  const [bridgeFee, setBridgeFee] = useState<bridgeFeeType>({
    lzFeeInt: 0,
    lzFeeString: "0.0",
  })

  // Account and balance information
  const { address, isConnected, isDisconnected, chainId, isConnecting } =
    useAccount({ config })
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address || "0x",
    chainId: chainId || 0,
  })

  // Chain switching utility
  const { switchChainAsync } = useSwitchChain({ config })

  // Redux state selectors
  const selectedNetwork = useSelector(
    (state: RootState) => state.selectedNetwork
  )

  const select_nETH_balance = useSelector(
    (state: RootState) => state.balance.nETH_Balance
  )

  const select_nETH_Rate = useSelector(
    (state: RootState) => state.balance.nETH_Rate
  )
  const selectedTransfer = useSelector(
    (state: RootState) => state.selectedTransfer.isTransferring
  )
  const selectedSecondNetwork = useSelector(
    (state: RootState) => state.selectedSecondNetwork
  )
  const selectedToken = useSelector((state: RootState) => state.selectedToken)

  useEffect(() => {
    const get_nETH_Blance = async () => {
      if (currentNetwork === "fractal") {
        const response = await fetch(
          `https://open-api-fractal-testnet.unisat.io/v1/indexer/address/${unisatState.address}/brc20/nativeETH/info`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_KEY}`,
            },
          }
        )
        if (!response.ok) {
          console.error("Error in response")
        }

        const result = await response.json()

        console.log("result?.data?", result?.data)
        const availableBalance = result?.data?.availableBalance || "0"
        console.log("fractal availableBalance", availableBalance)
        dispatch(set_nETH_Balance(availableBalance.toString()))
      } else if (currentNetwork === "rooch") {
        if (unisatState.address) {
          const addr = new BitcoinAddress(unisatState.address)

          const roochAddr = addr.genRoochAddress()

          const genRoochAddr = roochAddr.toBech32Address()
          const genRoochHexAddr = roochAddr.toHexAddress()

          console.log("btc address", { addr, genRoochAddr, genRoochHexAddr })
          const client = new RoochClient({
            url: getRoochNodeUrl("testnet"),
          })

          const result = await client.getBalances({
            owner: genRoochHexAddr
          })
          console.log("rooch result", result)
          console.log("rooch balance", result.data[1].balance)
          const balance = parseInt(result.data[1].balance) / 100000000
          dispatch(set_nETH_Balance(balance.toString()))
        }
      }
    }

    if (unisatState.connected) {
      console.log("calculating nETH")
      setnETHBalanceLoading(true)
      get_nETH_Blance().then(() => {
        setnETHBalanceLoading(false)
      })
    }

    if (!unisatState.connected) {
      dispatch(set_nETH_Balance("0.0"))
      setnETHBalanceLoading(false)
    }
  }, [unisatState.connected, select_nETH_balance, currentNetwork])

  // Fetches native balance and updates it when wallet is connected
  useEffect(() => {
    if (isBalanceLoading) {
      console.log("Fetching native token...")
    }

    if (isConnected && balanceData && selectedToken.symbol === "ETH") {
      setEthereumBalanceLoading(true)
      const formattedBalance = formatUnits(
        balanceData.value,
        balanceData.decimals
      )
      const balance = parseFloat(formattedBalance).toFixed(8) ?? ""

      dispatch(setTokenBalance({ index: 0, balance }))
      dispatch(setSelectedTokenBalance(balance))
      setEthereumBalanceLoading(false)
    }

    if (isDisconnected) {
      dispatch(resetStore())
    }
  }, [isConnected, balanceData])

  // Fetch and update ERC-20 tokens balances
  useEffect(() => {
    setnETHLoading(true)
    const calculate_nETH = async () => {
      const { BASE_POINT, sharePrice } = await get_nETH_rate({
        NETWORK_RPC: networkRPC[17000],
        DEPOSIT_CONTRACT:
          contractAddressesList[selectedNetwork.chainID].deposit,
        _value: parseEther(`${value}`),
        userAddress: "0x8a770B7700f941Bb2E6Dd023AD3B22c2c41C5901",
      })
      setnETHFormula({
        BASE_POINT: BASE_POINT,
        sharePrice: sharePrice,
      })
    }

    if (isDisconnected) {
      dispatch(resetStore())
    }

    calculate_nETH()

    setnETHLoading(false)
  }, [isConnected, isConnecting])

  // Handle input value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    const { BASE_POINT, sharePrice } = nETHFormula

    const nETH = (parseFloat(val) * sharePrice) / BASE_POINT

    if (val.includes(".") && val.split(".")[1].length > 8) {
      return
    }

    if (val.length > 8) {
      return
    }
    if (/^\d*\.?\d*$/.test(val)) {
      if (Number.isNaN(nETH)) {
        setnETHRate("0")
      } else {
        setnETHRate(nETH.toFixed(8))
      }
      setValue(val)
    }
  }

  async function getlzFee() {
    const TokenAddress =
      selectedToken.symbol === "WETH"
        ? contractAddressesList[selectedNetwork.chainID].WETH
        : selectedToken.symbol === "stETH"
        ? contractAddressesList[selectedNetwork.chainID].stETH
        : contractAddressesList[selectedNetwork.chainID].ETH

    const DestinationID =
      currentNetwork === "fractal"
        ? DestinationChainsMapping.fractal.destinationID
        : DestinationChainsMapping.rooch.destinationID
  }

  // Handle deposit button
  async function handleDepositFunc() {
    const DestinationID =
      currentNetwork === "fractal"
        ? DestinationChainsMapping.fractal.destinationID
        : DestinationChainsMapping.rooch.destinationID

    const addr = new BitcoinAddress(unisatState.address)

    const roochAddr = addr.genRoochAddress()

    const genRoochAddr = roochAddr.toBech32Address()
    const genRoochHexAddr = roochAddr.toHexAddress()
    const userAddress =
      currentNetwork === "fractal" ? unisatState.address : genRoochHexAddr

    console.log("DestinationID", DestinationID)
    console.log("Input Value :", value)
    console.log(
      "Max balance",
      (parseFloat(selectedToken.balance) - 0.001).toString()
    )
    console.log(
      "value > (parseFloat(selectedToken.balance) - 0.001).toString()",
      value > (parseFloat(selectedToken.balance) - 0.001).toString()
    )
    console.log("Number.isNaN(value)", Number.isNaN(value))
    console.log("value === 0", value === "0")
    console.log("value < 0", value < "0")

    if (value > (parseFloat(selectedToken.balance) - 0.001).toString()) {
      toast.error("Input amount cannot be greater than max balance")
      return
    }
    if (Number.isNaN(value)) {
      toast.error("Input amount cannot be empty")
      return
    }
    if (value === "0") {
      toast.error("Input amount cannot be 0")
      return
    }

    if (value < "0") {
      toast.error("Input amount cannot be less than 0")
      return
    }

    if (isDisconnected) return

    // Switch chain if necessary
    if (17000 !== chainId) {
      toast.info("Switch to correct Network")
      try {
        await switchChainAsync({ chainId: 17000 })
      } catch (error) {
        console.log("User rejected Tx", error)
        return
      }
    }
    dispatch(setTransferring(true))
    // const lzFee = await getlzFee()
    const nETH_rate = await get_nETH_rate({
      NETWORK_RPC: networkRPC[17000],
      DEPOSIT_CONTRACT: contractAddressesList[selectedNetwork.chainID].deposit,

      _value: parseEther(`${value}`),

      userAddress: address || "0x",
    })

    dispatch(set_nETH_Rate(nETH_rate.value))
    let DepositArgument
    let TokenAddress
    if (selectedToken.symbol === "WETH") {
      TokenAddress = contractAddressesList[selectedNetwork.chainID].WETH
      DepositArgument = 0
    } else if (selectedToken.symbol === "stETH") {
      DepositArgument = 0
      TokenAddress = contractAddressesList[selectedNetwork.chainID].stETH
    } else {
      DepositArgument = parseEther(`${value}`)
      TokenAddress = contractAddressesList[selectedNetwork.chainID].ETH
    }

    console.log({ DepositArgument, TokenAddress, userAddress })

    console.log("value", parseEther(`${value}`))

    console.log("Deposit ETH triggered")
    console.log(" _receiver", unisatState.address)

    const tx = await DepositETH({
      deposit: DepositArgument,
      _tokenAddress: TokenAddress,
      _receiver: userAddress || "0x",
      _value: parseEther(`${value}`),
      _destID: DestinationID,
      _lzFee: 100000000,
      Dispatch: dispatch,
      transferring: selectedTransfer,
      CONTRACT_ADDRESS: contractAddressesList[selectedNetwork.chainID].deposit,
    })
    if (tx) {
      toast.info(
        <div>
          You will receive {nETH_rate.value} nativeETH on {currentNetwork} in a
          few minutes
        </div>,
        {
          autoClose: 5000,
        }
      )
    }
    console.log("select_nETH_balance", select_nETH_balance)
    console.log("nETH_rate.value", nETH_rate.value)
    const balance =
      parseFloat(nETH_rate.value) + parseFloat(select_nETH_balance)
    console.log("predicted nETH balance:", balance)
    dispatch(set_nETH_Balance(balance.toString()))
  }

  return (
    <div className="w-full flex justify-center items-center  h-[88vh] ">
      <TransactionPopUp
        open={open}
        onStepChange={setActiveStep}
        bridgeFee={bridgeFee.lzFeeString}
        inputValue={value}
        nETH_Value={select_nETH_Rate}
      />
      <div className="py-6 px-4 w-[27rem] max-h-[37rem] h-fit bg-[#ffdb86]/[.4]  backdrop-blur-lg z-10  rounded-3xl ">
        <Header />

        <SourceContainer
          value={value}
          handleChange={handleChange}
          setValue={setValue}
          setnETH={setnETHRate}
          EthereumBalanceLoading={EthereumBalanceLoading}
        />

        <div className="w-full flex justify-center items-center text-slate-700 my-2">
          <SouthIcon sx={{ fontSize: 30 }} />
        </div>

        <DestinationContainer
          value={nETHRate}
          loading={nETHLoading}
          nETH_balance={select_nETH_balance}
          nETHBalanceLoading={nETHBalanceLoading}
        />

        <UniSatWallet onStateChange={handleUniSatStateChange} />

        <DepositButton
          handleClick={handleDepositFunc}
          isConnected={isConnected}
          uniSat={unisatState.connected}
          transferring={selectedTransfer}
          destinationChain={`${currentNetwork}`}
        />
      </div>
    </div>
  )
}

export default TokenBridge
