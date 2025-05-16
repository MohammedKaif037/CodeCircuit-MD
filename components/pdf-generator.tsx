"use client"

import { useState, useEffect } from "react"

interface PdfGeneratorProps {
  markdownContent: string
  filename: string
}

export function PdfGenerator({ markdownContent, filename }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState({
    jspdf: false,
    html2canvas: false,
  })

  useEffect(() => {
    // Better script loading with proper tracking
    const loadScript = (url: string, propertyName: 'jspdf' | 'html2canvas') => {
      if (!window[propertyName]) {
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.onload = () => {
          console.log(`${propertyName} loaded successfully`)
          setScriptsLoaded(prev => ({ ...prev, [propertyName]: true }))
        }
        script.onerror = () => {
          console.error(`Failed to load ${propertyName}`)
        }
        document.body.appendChild(script)
      } else {
        setScriptsLoaded(prev => ({ ...prev, [propertyName]: true }))
      }
    }

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf")
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas")
  }, [])

  const generatePdf = async () => {
    if (!markdownContent.trim()) {
      alert("Please enter some markdown content.")
      return
    }

    if (!scriptsLoaded.jspdf || !scriptsLoaded.html2canvas) {
      alert("PDF libraries are still loading. Please wait a moment and try again.")
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

      // Create a styled container for the content
      const contentContainer = document.createElement("div")
      contentContainer.innerHTML = htmlContent
      contentContainer.style.position = "absolute"
      contentContainer.style.left = "-9999px"
      contentContainer.style.top = "0"
      contentContainer.style.width = "650px" 
      contentContainer.style.padding = "40px"
      contentContainer.style.fontSize = "14px"
      contentContainer.style.lineHeight = "1.6"
      contentContainer.style.fontFamily = "Arial, sans-serif"
      contentContainer.style.color = "#000"
      contentContainer.style.backgroundColor = "#fff"

      // Style headings
      const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        heading.style.marginTop = '20px'
        heading.style.marginBottom = '10px'
        heading.style.fontWeight = 'bold'
      })

      // Style lists
      const lists = contentContainer.querySelectorAll('ul, ol')
      lists.forEach(list => {
        list.style.paddingLeft = '20px'
        list.style.marginBottom = '10px'
      })

      // Style blockquotes
      const quotes = contentContainer.querySelectorAll('blockquote')
      quotes.forEach(quote => {
        quote.style.borderLeft = '4px solid #ccc'
        quote.style.paddingLeft = '15px'
        quote.style.marginLeft = '0'
        quote.style.fontStyle = 'italic'
      })

      // Style code blocks
      const codeBlocks = contentContainer.querySelectorAll('pre code')
      codeBlocks.forEach(block => {
        block.parentElement.style.backgroundColor = '#f5f5f5'
        block.parentElement.style.padding = '10px'
        block.parentElement.style.borderRadius = '4px'
        block.parentElement.style.overflow = 'auto'
        block.parentElement.style.marginBottom = '10px'
      })

      // Style inline code
      const inlineCodes = contentContainer.querySelectorAll('code:not(pre code)')
      inlineCodes.forEach(code => {
        code.style.backgroundColor = '#f5f5f5'
        code.style.padding = '2px 4px'
        code.style.borderRadius = '4px'
        code.style.fontFamily = 'monospace'
      })

      document.body.appendChild(contentContainer)

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 200))

      // Make sure jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF not loaded properly")
      }

      const { jsPDF } = window.jspdf
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate content height to determine if multiple pages are needed
      const contentHeight = contentContainer.offsetHeight
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Use html2canvas to render to PDF
      const canvas = await window.html2canvas(contentContainer, {
        scale: 2, // Higher quality rendering
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      })

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      // Calculate scaling to fit on PDF page width
      const pageWidth = doc.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 20 // 10mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10
      let pageCount = 1

      // Add first page with image
      doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - position

      // Add additional pages if needed
      while (heightLeft > 0) {
        doc.addPage()
        pageCount++
        position = 10 // Reset position to top of page with margin
        doc.addImage(imgData, 'JPEG', 10, position - (pageHeight * (pageCount - 1)), imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Add metadata
      doc.setProperties({
        title: filename || "Document",
        creator: "Markdown Editor",
        subject: "Generated PDF from Markdown",
        keywords: "markdown, pdf, document",
      })

      // Save the PDF
      doc.save(`${filename || "document"}.pdf`)
      
      // Clean up
      document.body.removeChild(contentContainer)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Error generating PDF: ${error.message || "Unknown error"}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={generatePdf}
        disabled={isGenerating || !scriptsLoaded.jspdf || !scriptsLoaded.html2canvas}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
        id="generatePdfBtn"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner />
            Creating PDF...
          </>
        ) : !scriptsLoaded.jspdf || !scriptsLoaded.html2canvas ? (
          <>
            <LoadingSpinner />
            Loading PDF tools...
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

// Extend global types
declare global {
  interface Window {
    jspdf: {
      jsPDF: any
    }
    html2canvas: any
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
