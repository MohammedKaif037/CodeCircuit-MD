"use client"

import { useState } from "react"

interface PdfGeneratorProps {
  markdownContent: string
  filename: string
}

export function PdfGenerator({ markdownContent, filename }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = async () => {
    // Quick content check
    if (!markdownContent.trim()) {
      alert("Please add some content before generating a PDF.")
      return
    }

    // Make sure we have the preview element
    const previewElement = document.getElementById("markdownPreview")
    if (!previewElement) {
      console.error("Markdown preview element not found")
      return
    }

    setIsGenerating(true)

    try {
      // Dynamically import html2pdf
      const html2pdf = (await import("html2pdf.js")).default
      
      // Create a clone to avoid modifying the original DOM
      const clone = previewElement.cloneNode(true) as HTMLElement
      
      // Fix common issues that cause blank PDFs
      clone.style.height = "auto"
      clone.style.maxHeight = "none" // Remove any height constraints
      clone.style.overflow = "visible"
      clone.style.width = "210mm" // A4 width
      clone.style.padding = "15mm"
      
      // We need this clone in the document for html2pdf to see it properly
      document.body.appendChild(clone)
      clone.style.position = "fixed"
      clone.style.top = "-9999px" // Hide it offscreen
      
      // Let browser render the clone before capturing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Generate the PDF with better settings
      const pdfResult = await html2pdf().from(clone).set({
        filename: `${filename || "document"}.pdf`,
        margin: [15, 15, 15, 15],
        html2canvas: {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        // Improved page breaking settings
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      }).save()
      
      // Clean up after ourselves
      document.body.removeChild(clone)
      
      return true
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("Sorry, something went wrong while creating your PDF. Please try again.")
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
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
  )
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
