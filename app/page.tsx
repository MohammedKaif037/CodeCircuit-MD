// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { PdfGenerator } from "@/components/pdf-generator"

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState("")
  const [filename, setFilename] = useState("notes")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const savedContent = localStorage.getItem("markdownContent")
    if (savedContent) {
      setMarkdownContent(savedContent)
    }
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
    <main className="min-h-screen bg-gradient-to-r from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-800">
          Notes Making App
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <div className="flex-grow">
              <input
                type="text"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="Enter PDF filename"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full md:w-64"
              />
            </div>
            <PdfGenerator
              markdownContent={markdownContent}
              filename={filename}
              apiKey={process.env.NEXT_PUBLIC_API_KEY}
              onSuccess={handlePdfSuccess}
            />
          </div>

          {showSuccessMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <p className="font-medium">Success! PDF has been generated.</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <MarkdownEditor value={markdownContent} onChange={handleContentChange} />
          <MarkdownPreview content={markdownContent} />
        </div>
      </div>
    </main>
  )
}
