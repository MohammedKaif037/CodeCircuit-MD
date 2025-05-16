"use client"

import { useEffect, useState } from "react"

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    // Import marked library dynamically
    import("marked").then((marked) => {
      // Configure marked options if needed
      marked.marked.setOptions({
        breaks: true,
        gfm: true,
      })

      // Parse markdown to HTML
      const parsedHtml = marked.marked.parse(content)
      setHtml(parsedHtml)
    })
  }, [content])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div
        id="markdownPreview"
        className="prose max-w-none h-96 p-6 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
