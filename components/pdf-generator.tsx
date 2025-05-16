"use client"

import { useState, useEffect } from "react"

interface PdfGeneratorProps {
  markdownContent: string
  filename: string
}

export function PdfGenerator({ markdownContent, filename }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!window.jspdf) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      script.async = true
      script.onload = () => console.log("jsPDF loaded")
      document.body.appendChild(script)
    }
  }, [])

  const generatePdf = async () => {
    if (!markdownContent.trim()) {
      alert("Please enter some markdown content.")
      return
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("jsPDF is not ready yet. Please try again in a moment.")
      return
    }

    setIsGenerating(true)
    setShowSuccess(false)

    try {
      const marked = await import("marked")
      marked.marked.setOptions({
        breaks: true,
        gfm: true,
      })

      const htmlContent = marked.marked.parse(markdownContent)

      const hiddenDiv = document.createElement("div")
      hiddenDiv.innerHTML = htmlContent
      hiddenDiv.style.position = "absolute"
      hiddenDiv.style.left = "-9999px"
      hiddenDiv.style.top = "0"
      hiddenDiv.style.width = "600px"
      hiddenDiv.style.zIndex = "-1"
      document.body.appendChild(hiddenDiv)

      const { jsPDF } = window.jspdf
      const doc = new jsPDF()

      setTimeout(() => {
        doc.html(hiddenDiv, {
          callback: function (doc) {
            doc.save(`${filename || "document"}.pdf`)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            document.body.removeChild(hiddenDiv)
          },
          x: 10,
          y: 10,
          width: 180,
          windowWidth: 650,
          autoPaging: "text",
          margin: [10, 10, 10, 10]
        })
      }, 0)

    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating your PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={generatePdf}
        disabled={isGenerating}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
        id="generatePdfBtn"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner />
            Creating PDF...
          </>
        ) : (
          "Export as PDF"
        )}
      </button>

      {showSuccess && (
        <div className="absolute top-full mt-2 p-2 bg-green-100 text-green-800 rounded-md text-sm" id="successMessage">
          PDF created successfully!
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    jspdf: {
      jsPDF: any
    }
  }
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}
