"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter, VT323 } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

// initialize the Inter font with latin subset
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
// Add VT323 for cyberpop style
const vt323 = VT323({ 
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-vt323"
})

// Metadata for the app, used for SEO and page info
export const metadata: Metadata = {
  title: "CyberNotes - Markdown Editor",
  description: "Create and export markdown notes to PDF in cyberpop style",
  generator: 'Kaif'
}

// RootLayout component wraps all pages and provides consistent layout
export default function RootLayout({
  children, // the content to be rendered inside this layout
}: {
  children: React.ReactNode // typing the children prop
}) {
  return (
    <html lang="en" className={`${inter.variable} ${vt323.variable}`}>
      <body className={`${vt323.className} font-bold`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

