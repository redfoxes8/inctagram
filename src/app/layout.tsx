import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/widgets/header"

import "./globals.css"
import { QueryProvider } from "@/app/providers/query-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Inctagram",
  description: "Educational project: Inctagram with FSD architecture",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <QueryProvider>
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
