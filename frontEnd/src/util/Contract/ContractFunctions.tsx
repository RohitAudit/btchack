import { ethers, BigNumber } from "ethers"

import DepositABI from "./Abi/Holesky/DepositProxy.json"
import WethABI from "./Abi/Holesky/WETH.json"
import { toast } from "react-toastify"
import { setTransferring } from "@/store/transferSlice"

interface CalculateLayerZeroFeesProps {
  // OPTIONS: any
  // MINT: string
  NETWORK_RPC: string
  DEPOSIT_CONTRACT: string
  _tokenAddress: `0x${string}` | undefined
  _receiverAddress: string
  userAddress: string
  _value: BigInt
  _destID: number
}

export async function CalculateLayerZeroFees({
  NETWORK_RPC,
  DEPOSIT_CONTRACT,
  _tokenAddress,
  _receiverAddress, // destination
  userAddress,
  _value,
  _destID,
}: CalculateLayerZeroFeesProps) {
  const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)
  const signer = await provider.getSigner(userAddress)
  const contractAddress = DEPOSIT_CONTRACT
  const depositContract = new ethers.Contract(
    contractAddress,
    DepositABI as any,
    signer
  )

  try {
    const fees = await depositContract.getlzFee(
      _tokenAddress,
      _receiverAddress,
      _value,
      _destID
    )

    let feesString = fees.toString().split(",")[0]

    if (feesString.length <= 18) {
      feesString = feesString.padStart(19, "0")
    }

    let decimalValue = feesString.slice(0, -18) + "." + feesString.slice(-18)

    let roundedValue = parseFloat(decimalValue).toFixed(8)

    return {
      LZ_FEE_BigInt: feesString,
      LZ_FEE_Decimal: roundedValue.toString(),
    }
  } catch (error: any) {
    console.log("Bridge fee calulation error", error)

    return {
      LZ_FEE_BigInt: 0,
      LZ_FEE_Decimal: "0.0",
    }
  }
}

interface get_nETHProps {
  NETWORK_RPC: string
  DEPOSIT_CONTRACT: string
  userAddress: string
  _value: BigInt
}

export async function get_nETH_rate({
  NETWORK_RPC,
  DEPOSIT_CONTRACT,

  userAddress,
  _value,
}: get_nETHProps) {
  const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)
  const signer = await provider.getSigner(userAddress)
  const contractAddress = DEPOSIT_CONTRACT
  const depositContract = new ethers.Contract(
    contractAddress,
    DepositABI as any,
    signer
  )

  try {
    const BASE_POINT = await depositContract.BASE_POINT()

    const sharePrice = await depositContract.sharePrice()

    console.log({ BASE_POINT, sharePrice, _value })

    //@ts-ignore
    const result: any = _value * BigInt(sharePrice)
    const nETHBigInt: any = result / BigInt(BASE_POINT)
    const nETHDecimal = Number(nETHBigInt) / 10 ** 18

    const nETH = nETHDecimal.toFixed(8)

    return {
      value: nETH,
      BASE_POINT: BASE_POINT,
      sharePrice: sharePrice,
    }
  } catch (error: any) {
    console.log(" nETH fee calulation error", error)

    return {
      value: "0.0",
      BASE_POINT: 0,
      sharePrice: 0,
    }
  }
}

interface depositERCProps {
  deposit: number | bigint
  _tokenAddress: any
  _receiver: string
  _value: bigint
  _destID: number
  _lzFee: number

  transferring: boolean
  CONTRACT_ADDRESS: string
  onStepChange: (step: number) => void
  setOpen: (value: boolean) => any
  Dispatch: any
}

export const DepositERC: React.FC<depositERCProps> = async ({
  deposit,
  _tokenAddress,
  _receiver, // destination
  _value,
  _destID,
  _lzFee,
  CONTRACT_ADDRESS,
  transferring,

  onStepChange,
  setOpen,
  Dispatch,
}) => {
  setOpen(true)
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  if (transferring === false) {
    const signer = provider.getSigner()
    const contractAddress = CONTRACT_ADDRESS
    const TokenContract = new ethers.Contract(
      _tokenAddress,
      WethABI as any,
      provider
    )

    const TokenSigner = TokenContract.connect(signer)
    const depositContract = new ethers.Contract(
      contractAddress,
      DepositABI as any,
      provider
    )

    const ContractSigner = depositContract.connect(signer)
    const pendingToastId = toast.loading("Transaction Pending...", {
      icon: "⏳" as any,
    })

    try {
      onStepChange(0)
      const approveTx = await TokenSigner.approve(CONTRACT_ADDRESS, _value)
      await approveTx.wait()
      onStepChange(1)
      const tx = await ContractSigner.deposit(
        _tokenAddress,
        _receiver,
        _value,
        _destID,
        _lzFee,
        { value: BigInt(deposit) + BigInt(_lzFee) }
      )

      const receipt = await tx.wait()

      onStepChange(2)
      toast.update(pendingToastId, {
        render: <div>Transaction Successful! </div>,
        type: "success",
        icon: "✅" as any,
        autoClose: 5000,
        isLoading: false,
      })

      if (tx) {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.log("Deposit tx error", error)
      toast.update(pendingToastId, {
        render: `Transaction Failed`,
        type: "error",
        icon: "❌" as any,
        autoClose: 5000,
        isLoading: false,
      })
    } finally {
      setOpen(false)
      Dispatch(setTransferring(false))
    }
  }
}

interface depositETHProps {
  deposit: number | bigint
  _tokenAddress: any
  _receiver: string
  _value: bigint
  _destID: number
  _lzFee: number
  transferring: boolean
  CONTRACT_ADDRESS: string
  Dispatch: any
}
export const DepositETH: React.FC<depositETHProps> = async ({
  deposit,
  _tokenAddress,
  _receiver, // destination
  _value,
  _destID,
  _lzFee,
  CONTRACT_ADDRESS,
  transferring,
  Dispatch,
}) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  console.log("provider", provider)
  if (transferring === false) {
    const signer = provider.getSigner()
    const contractAddress = CONTRACT_ADDRESS

    const depositContract = new ethers.Contract(
      contractAddress,
      DepositABI as any,
      provider
    )

    const ContractSigner = depositContract.connect(signer)
    const pendingToastId = toast.loading("Transaction Pending...", {
      icon: "⏳" as any,
    })

    try {
      const tx = await ContractSigner.deposit(
        _tokenAddress,
        _receiver,
        _value,
        _destID,
        _lzFee,
        { value: BigInt(deposit) + BigInt(_lzFee) }
      )

      const receipt = await tx.wait()

      toast.update(pendingToastId, {
        render: <div>Transaction Successful! </div>,
        type: "success",
        icon: "✅" as any,
        autoClose: 5000,
        isLoading: false,
      })

      // toast.info(
      //   <div>
      //     View{" "}
      //     <a
      //       href={`https://holesky.etherscan.io/tx/${receipt.transactionHash}`}
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       style={{ color: "var(--secondary)", textDecoration: "underline" }}
      //     >
      //       Tx
      //     </a>
      //   </div>,
      //   {
      //     autoClose: 7000,
      //   }
      // )

      if (tx) {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.log("Deposit tx error", error)
      toast.update(pendingToastId, {
        render: `Transaction Failed`,
        type: "error",
        icon: "❌" as any,
        autoClose: 5000,
        isLoading: false,
      })
    } finally {
      Dispatch(setTransferring(false))
    }
  }
}
interface fetch_ERCBalanceProps {
  NETWORK_RPC: string
  CONTRACT_ADDRESS: string
  USER_ADDRESS: `0x${string}` | undefined
  abi: any
}

export async function fetch_ERC20Balance({
  NETWORK_RPC,
  abi,
  CONTRACT_ADDRESS,
  USER_ADDRESS,
}: fetch_ERCBalanceProps) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)
    const signer = await provider.getSigner(USER_ADDRESS)
    const contractAddress = CONTRACT_ADDRESS
    const ERC20Contract = new ethers.Contract(contractAddress, abi, signer)

    const balance = await ERC20Contract.balanceOf(USER_ADDRESS)
    const balanceInNumber = ethers.BigNumber.from(balance).toString()

    let BalanceString = balanceInNumber.toString().split(",")[0]

    if (BalanceString.length <= 18) {
      BalanceString = BalanceString.padStart(19, "0")
    }

    let decimalValue =
      BalanceString.slice(0, -18) + "." + BalanceString.slice(-18)

    let roundedValue = parseFloat(decimalValue).toFixed(8)

    return {
      roundedValue,
    }
  } catch (error) {
    console.log("Error in fetch_Erc20 balance", error)
  }
}
