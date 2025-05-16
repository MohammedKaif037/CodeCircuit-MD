"use client"

import { useEffect, useState } from "react"

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    // Only process if we have content
    if (!content) {
      setHtml("");
      return;
    }
    
    // Import marked library dynamically
    import("marked").then((marked) => {
      // Better marked configuration for PDF compatibility
      marked.marked.setOptions({
        breaks: true, // Convert line breaks to <br>
        gfm: true,    // GitHub flavored markdown
        headerIds: true, // Generate IDs for headers for better TOC support
        mangle: false, // Don't escape HTML
      })

      try {
        // Parse markdown to HTML
        const parsedHtml = marked.marked.parse(content)
        setHtml(parsedHtml)
      } catch (err) {
        console.error("Error parsing markdown:", err)
        setHtml(`<p>Error parsing markdown: ${err.message}</p>`)
      }
    })
  }, [content])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div 
        id="markdownPreview"
        className="prose prose-slate max-w-none h-96 p-6 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
