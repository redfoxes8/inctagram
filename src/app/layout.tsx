import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SidebarWrapper } from "@/shared/ui/Sidebar"
import "./globals.css"
import { StoreProvider } from "./providers/StoreProvider"

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
        <div>
          <SidebarWrapper />
          <main>
            <StoreProvider>{children}</StoreProvider>
          </main>
        </div>
      </body>
    </html>
  )
}
