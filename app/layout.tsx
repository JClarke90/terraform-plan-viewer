import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "geist/font"
import "./globals.css"

export const metadata: Metadata = {
  title: "Terraform Plan Viewer",
  description: "A React application for visualizing Terraform plan outputs",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${Geist.variable} ${Geist_Mono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
