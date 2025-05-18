// app/layout.tsx

import type React from "react"
// Import global CSS styles for the entire app
import "./globals.css"
// Import Metadata type from next for defining page metadata
import type { Metadata } from "next"
// import the Inter font from Google Fonts via Next.js font optimization
import { Inter } from "next/font/google"

// initialize the Inter font with latin subset
const inter = Inter({ subsets: ["latin"] })

// Metadata for the app, used for SEO and page info
export const metadata: Metadata = {
  title: "Markdown Notes App", // title shown in browser tab
  description: "Create and export markdown notes to PDF", // description for search engines
  generator: 'Kaif' 
}

// RootLayout component wraps all pages and provides consistent layout
export default function RootLayout({
  children, // the content to be rendered inside this layout
}: {
  children: React.ReactNode // typing the children prop
}) {
  return (
    <html lang="en"> {/* set document language to English */}
      <body className={inter.className}> {/* apply Inter font to the entire body */}
        {children} {/* render child components/pages here */}
      </body>
    </html>
  )
}
