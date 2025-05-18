"use client"

import { useState, useEffect } from "react"
import type React from "react"
import MarkdownEditor from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { PdfGenerator } from "@/components/pdf-generator"

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState("")
  const [filename, setFilename] = useState("cybernotes")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isBootUp, setIsBootUp] = useState(true)

  useEffect(() => {
    const savedContent = localStorage.getItem("markdownContent")
    if (savedContent) {
      setMarkdownContent(savedContent)
    }

    const timer = setTimeout(() => setIsBootUp(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem("markdownContent", markdownContent)
  }, [markdownContent])

  const handleContentChange = (content: string) => {
    setMarkdownContent(content)
  }

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value)
  }

  const handlePdfSuccess = () => {
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  return (
    <main className={`min-h-screen bg-cyberpink text-cyberblue font-bold ${isBootUp ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-8 animate-vhs-flicker">
        <h1 className="text-3xl md:text-5xl font-bungee text-center mb-6 md:mb-10">
          CYBERNOTES 3000
        </h1>

        <div className="bg-gradient-to-br from-cybercyan to-cyberpurple p-4 md:p-6 border-4 border-black shadow-cyber-lg rounded-lg mb-6">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <div className="flex-grow">
              <input
                type="text"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="Enter PDF filename"
                className="px-3 py-2 border-2 border-black bg-pink-100 rounded-md text-sm w-full md:w-64 text-cyberblue shadow-cyber"
              />
            </div>
            <PdfGenerator
              markdownContent={markdownContent}
              filename={filename}
              apiKey={process.env.NEXT_PUBLIC_API_KEY}
              onSuccess={handlePdfSuccess}
              className="cassette-btn px-4 py-2 bg-pink-100 hover:bg-cybercyan text-cyberblue font-bungee shadow-cyber"
            />
          </div>

          {showSuccessMessage && (
            <div
              className="border-2 border-black bg-cybercyan px-4 py-3 rounded mb-4 text-center font-bungee text-cyberblue animate-bounce"
              role="alert"
            >
              <p className="font-medium">DATA EXPORT COMPLETE!</p>
            </div>
          )}
        </div>

        {/* Refactored layout with flex and full height children */}
        <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
          <div className="flex-1 h-full">
            <MarkdownEditor value={markdownContent} onChange={handleContentChange} />
          </div>
          <div className="flex-1 h-full">
            <MarkdownPreview content={markdownContent} />
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-cyberblue/50 font-mono">
          SYSTEM READY {new Date().getFullYear()} v3.1.4
        </div>
      </div>
    </main>
  )
}
