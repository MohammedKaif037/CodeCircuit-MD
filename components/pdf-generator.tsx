"use client"

import { useState } from "react"

interface PdfGeneratorProps {
  markdownContent: string
  filename: string
}

export function PdfGenerator({ markdownContent, filename }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = async () => {
    if (!markdownContent.trim()) {
      alert("Please enter some markdown content.")
      return
    }

    const element = document.getElementById("markdownPreview")
    if (!element) return

    setIsGenerating(true)

    try {
      // Import html2pdf dynamically
      const html2pdf = (await import("html2pdf.js")).default

      // Create a clone of the preview element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement

      // Remove height constraint and overflow to ensure all content is visible
      clonedElement.style.height = "auto"
      clonedElement.style.overflow = "visible"
      clonedElement.style.maxWidth = "100%"

      // Add A4 sizing
      clonedElement.classList.add("pdf-content")

      // Temporarily append to document but hide it
      clonedElement.style.position = "absolute"
      clonedElement.style.left = "-9999px"
      document.body.appendChild(clonedElement)

      // Generate PDF with proper A4 formatting
      await html2pdf()
        .from(clonedElement)
        .set({
          filename: `${filename || "notes"}.pdf`,
          margin: [15, 15, 15, 15],
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .save()

      // Clean up the cloned element
      document.body.removeChild(clonedElement)

      return true
    } catch (error) {
      console.error("Error generating PDF:", error)
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
          Generating PDF...
        </>
      ) : (
        "Generate PDF"
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
