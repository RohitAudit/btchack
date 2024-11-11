import { Instrument_Serif, Instrument_Sans, Inter } from "@next/font/google"

export const interfFont = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const instrumentSerifFont = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
})
export const instrumentSansFont = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
})
