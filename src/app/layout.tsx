import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/widgets/header"

import "./globals.css"
import { QueryProvider } from "@/app/providers/query-provider"
import { AuthProvider } from "@/features/auth/lib/auth-provider"
import { Toaster } from "sonner"

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
          <AuthProvider>
            {/* {children} */}
            <Toaster position="bottom-left" richColors closeButton duration={3000} visibleToasts={5} />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
