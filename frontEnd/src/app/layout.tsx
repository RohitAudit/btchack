import type { Metadata } from "next"
import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"
import { Providers } from "@/util/wallet/providers"
import Navbar from "@/components/Navbar"
import { interfFont } from "./fonts"
import { AptosProviders } from "@/util/wallet/providers"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css"
import ReduxProvider from "@/store/providers"
import { WalletProvider } from "@/util/wallet/providers"
import Head from "next/head"

export const metadata: Metadata = {
  title: "Raga.finance",
  description: "Earn native yields on Raga.finance ",
  applicationName: "Raga.finance",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="icon" href="/logo.svg" sizes="32x32" /> */}
        <link rel="icon" href="/logo.svg" sizes="64x64" type="image/svg+xml" />
      </head>
      <body className={`${interfFont.className}antialiased`}>
        <ReduxProvider>
          <ToastContainer
            theme="light"
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            toastStyle={{ backgroundColor: "#fff0cd" }}
            toastClassName="custom-toast"
          />

          <Providers>
            <Navbar />
            {children}
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  )
}
