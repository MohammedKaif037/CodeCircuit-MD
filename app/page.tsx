"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { PdfGenerator } from "@/components/pdf-generator"

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState("")
  const [filename, setFilename] = useState("cyberpop_notes")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Initialize content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem("markdownContent")
    if (savedContent) {
      setMarkdownContent(savedContent)
    } else {
      // Default cyberpop-themed content for new users
      setMarkdownContent(`# Welcome to CyberNotes 2025!

## Your digital notebook for the future

*Type your notes in **CYBERPOP** style!*

- Neon pink headers
- Electric blue accents
- Digital vibes

> "The future is now, old man!" - Digital philosophers

\`\`\`
function hackTheMainframe() {
  return "Access Granted";
}
\`\`\`

![Cool digital art](/placeholder.svg?height=200&width=300)

---

Made with 💖 in the digital dimension
`)
    }
  }, [])
  
  // Save content to localStorage whenever it changes
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

  // Geometric pattern background element
  const GeometricPattern = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full opacity-10">
        {Array(36).fill(0).map((_, i) => (
          <div key={i} className={`${
            i % 3 === 0 ? 'bg-fuchsia-500' : i % 3 === 1 ? 'bg-cyan-400' : 'bg-blue-600'
          } rounded-none`}></div>
        ))}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-fuchsia-300 text-blue-900 font-bold p-4 md:p-8 relative overflow-hidden">
      <GeometricPattern />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-center mb-2 text-blue-900 drop-shadow-[2px_2px_0_#d946ef]">
            CYBER<span className="text-fuchsia-600">NOTES</span>
          </h1>
          <div className="text-xl bg-blue-900 text-cyan-200 inline-block px-4 py-1 transform -rotate-1 font-bold">
            MARKDOWN · EXPORT · 2025
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-200 to-fuchsia-200 border-4 border-black shadow-[8px_8px_0_#1e40af] p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex-grow">
              <input
                type="text"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="Enter PDF filename"
                className="px-3 py-2 bg-pink-100 border-2 border-black text-blue-900 w-full md:w-64 
                        shadow-[4px_4px_0_#1e40af] focus:outline-none font-bold"
              />
            </div>
            <PdfGenerator 
              markdownContent={markdownContent} 
              filename={filename} 
              apiKey="cE0VrJS9jaKkJ5BK99T65Kfsu7y7EqwNA1FHHlOkqvqv40iSG4wlBunXN1mBAUG4" 
            />
          </div>
          
          {showSuccessMessage && (
            <div className="bg-cyan-200 border-2 border-black text-blue-900 px-4 py-3 shadow-[4px_4px_0_#1e40af] mb-4" role="alert">
              <p className="font-bold flex items-center">
                <span className="mr-2">✓</span> PDF SAVED SUCCESSFULLY!
              </p>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-200 to-fuchsia-200 border-4 border-black p-4 shadow-[8px_8px_0_#1e40af]">
            <div className="bg-blue-900 text-cyan-200 py-1 px-3 mb-4 font-bold inline-block">
              EDIT MODE
            </div>
            <MarkdownEditor value={markdownContent} onChange={handleContentChange} />
          </div>
          
          <div className="bg-gradient-to-br from-cyan-200 to-fuchsia-200 border-4 border-black p-4 shadow-[8px_8px_0_#1e40af]">
            <div className="bg-blue-900 text-cyan-200 py-1 px-3 mb-4 font-bold inline-block">
              PREVIEW MODE
            </div>
            <MarkdownPreview content={markdownContent} />
          </div>
        </div>
        
        <footer className="mt-8 text-center text-blue-900">
          <div className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 border-2 border-black inline-block px-4 py-1">
            CYBERPOP NOTES © 2025
          </div>
        </footer>
      </div>
    </main>
  )
}

        </div>
      </div>
    </main>
  )
}
