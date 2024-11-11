import {
  Account,
  AccountData,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  GetCurrentFungibleAssetBalancesResponse,
  InputEntryFunctionData,
  InputViewFunctionData,
  MoveModule,
  MoveModuleBytecode,
  Network,
  AptosApiError,
} from "@aptos-labs/ts-sdk"

import { toast } from "react-toastify"
function setupMovementConfig(): Aptos | null {
  try {
    const config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: process.env.NEXT_PUBLIC_MOVEMENT_NODE_URL,
      indexer: process.env.NEXT_PUBLIC_MOVEMENT_INDEXER_URL,
    })
    console.log(
      "process.env.MOVEMENT_INDEXER_URL",
      process.env.NEXT_PUBLIC_MOVEMENT_INDEXER_URL
    )
    const aptos = new Aptos(config)
    return aptos
  } catch (error) {
    console.error("error in setupMovementConfig", error)
  }
  return null
}

async function getNETHMetdata(
  aptos: Aptos,
  module: MoveModuleBytecode
): Promise<string | undefined> {
  try {
    const payload: InputViewFunctionData = {
      function: `${module.abi?.address}::nexus_coin::get_metadata`,
      functionArguments: [],
    }
    const res = (await aptos.view<[{ inner: string }]>({ payload }))[0]
    return res.inner
  } catch (error) {
    console.error("error in getNETHMetdata", error)
  }
  return undefined
}
async function getUserNETHBalance(
  aptos: Aptos,
  module: MoveModuleBytecode,
  user: AccountData,
  metadata: string
): Promise<number> {
  const payload: InputViewFunctionData = {
    function: `0x1::primary_fungible_store::balance`,
    typeArguments: [`0x1::fungible_asset::Metadata`],
    functionArguments: [user.authentication_key, metadata],
  }
  const res = (await aptos.view<[number]>({ payload }))[0]
  return res
}

// async function getUserNETHBalance(
//   aptos: Aptos,
//   user: AccountData,
//   metadata: string
// ): Promise<number> {
//   try {
//     const data = await aptos.getCurrentFungibleAssetBalances({
//       options: {
//         where: {
//           owner_address: { _eq: user.authentication_key },
//           asset_type: { _eq: metadata },
//         },
//       },
//     })

//     console.log("data", data)

//     if (data && data.length > 0) {
//       return data[0].amount
//     }
//   } catch (error) {
//     console.error("Error in getUserNETHBalance", error)
//   }

//   return 0.0
// }

export async function main({
  movement_user_address,
}: {
  movement_user_address: string
}) {
  const aptos = setupMovementConfig()
  if (!aptos) {
    console.error("Aptos setup failed. Returning 0.")
    return 0.0
  }

  console.log("movement_user_address", movement_user_address)
  let user
  try {
    user = await aptos.getAccountInfo({
      accountAddress: movement_user_address ?? "",
    })
  } catch (error) {
    toast.info(
      <div>
        Please Mint some Move tokens using{" "}
        <a
          href={`https://mizu.testnet.porto.movementnetwork.xyz/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#17a8dc", textDecoration: "underline" }}
        >
          faucet{" "}
        </a>
        for new account
      </div>,
      {
        autoClose: 7000,
      }
    )
    console.error("User account not found", error)
    return 0.0
  }

  if (!user) {
    console.error("User account not found. Returning 0.")
    return 0.0
  }

  const module = await aptos.getAccountModule({
    accountAddress: process.env.NEXT_PUBLIC_MOVEMENT_BRIDGE_ADDRESS ?? "",
    moduleName: "nexus_coin",
  })
  console.log("module ", module)

  const tokenMetadata = await getNETHMetdata(aptos, module)
  if (!tokenMetadata) {
    console.error("Token metadata retrieval failed. Returning 0.")
    return 0.0
  }

  const balance = await getUserNETHBalance(aptos, module, user, tokenMetadata)
  console.log("balanceINT", balance)
  if (balance > 0) {
    const decimalBalance = balance / 100000000
    return decimalBalance
  }

  return 0.0
}
