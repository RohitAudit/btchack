import {
  getDefaultConfig,
  AvatarComponent,
  darkTheme,
  Theme,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
  berachainTestnet,
  holesky,
} from "wagmi/chains"
import merge from "lodash.merge"
export const config = getDefaultConfig({
  appName: "Raga.Finance",
  projectId: process.env.NEXT_PUBLIC_WALLET_ID || "",
  chains: [holesky, polygon, optimism, arbitrum, base],
  ssr: true,
})

export const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return ensImage ? (
    <img
      src={ensImage}
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
    />
  ) : (
    <img
      src="/icons/avatar2.png"
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
    />
  )
}

export const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: "var(--secondary)",
    connectButtonBackground: "var(--darkBg)",
    connectButtonInnerBackground: "var(--darkBg)",
    modalBackground: "var(--bg)",
    profileForeground: "var(--primary)",
  },
} as Theme)
