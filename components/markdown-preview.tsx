'use client'

import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

interface MarkdownPreviewProps {
  content: string
}

export  function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    const parseMarkdown = async () => {
      if (!content) {
        setHtml("")
        return
      }

      try {
        const marked = await import("marked")
        marked.marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false,
        })

        const dirtyHtml = marked.marked.parse(content)
        setHtml(DOMPurify.sanitize(dirtyHtml))
      } catch (err) {
        console.error("Markdown parsing error:", err)
        setHtml(`<p class="text-red-500">ERROR: ${err.message}</p>`)
      }
    }

    parseMarkdown()
  }, [content])

  return (
    <div className="relative bg-pink-50 rounded-lg border-2 border-black shadow-cyber-lg overflow-hidden crt">
      <div 
        className="prose prose-sm md:prose-base h-full p-6 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="absolute bottom-2 right-2 text-xs text-cyberblue/50 font-mono">
        CYBERPREVIEW v3.1
      </div>
    </div>
  )
}
