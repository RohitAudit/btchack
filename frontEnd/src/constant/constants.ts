import fractalLogo from "/public/Icons/fractal-logo1.png"
import roochLogo from "/public/Icons/rooch_logo.svg"

export const contractAddressesList: any = {
  17000: {
    deposit: "0x19Dd8fc5f87AAD2503f5eB1780de1b24CC0AAECd",
    WETH: "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
    stETH: "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
    ETH: "0x0000000000000000000000000000000000000000",
  },
}

export const networkRPC: any = {
  17000:
    `${process.env.NEXT_PUBLIC_HOLESKY_RPC_URL}` ||
    "https://ethereum-holesky-rpc.publicnode.com",

  80084: "https://bartio.rpc.berachain.com/",
}

export const DestinationChains = [
  {
    name: "fractal",
    icon: fractalLogo,
    destinationID: 69,
    wallet: true,
    chainID: 69,
  },
  {
    name: "rooch",
    icon: roochLogo,
    destinationID: 420,
    wallet: true,
    chainID: 420,
  },
]

export const DestinationChainsMapping = {
  fractal: {
    name: "fractal",
    icon: fractalLogo,
    destinationID: 69,
    wallet: true,
    chainID: 69,
  },
  rooch: {
    name: "rooch",
    icon: roochLogo,
    destinationID: 420,
    wallet: true,
    chainID: 420,
  },
}
