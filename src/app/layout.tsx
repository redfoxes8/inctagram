import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { QueryProvider } from "@/app/providers/query-provider"
import { ApolloProvider } from "@/app/providers/apollo-provider"
import { SiteShell } from "@/app/providers/site-shell"
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
        <ApolloProvider>
          <QueryProvider>
            <SiteShell>{children}</SiteShell>
            <Toaster position="bottom-left" richColors closeButton duration={3000} visibleToasts={5} />
          </QueryProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
