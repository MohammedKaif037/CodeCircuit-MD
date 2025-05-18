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
    dompurify: false,
  })

  useEffect(() => {
    // Load required scripts
    const loadScript = (url: string, propertyName: 'jspdf' | 'dompurify') => {
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

    // Load jsPDF with html plugin
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf")
    
    // Load DOMPurify for sanitizing HTML
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.1/purify.min.js", "dompurify")
    
    // Dynamically load the html plugin after jsPDF
    const loadHtmlPlugin = () => {
      if (window.jspdf && !window.jspdf.jsPDF?.prototype?.html) {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        script.async = true
        document.body.appendChild(script)
      }
    }
    
    // Check if jspdf is loaded every 500ms and load the html plugin when it is
    const checkJsPdfInterval = setInterval(() => {
      if (window.jspdf) {
        loadHtmlPlugin()
        clearInterval(checkJsPdfInterval)
      }
    }, 500)
    
    return () => clearInterval(checkJsPdfInterval)
  }, [])

  const generatePdf = async () => {
    if (!markdownContent.trim()) {
      alert("Please enter some markdown content.")
      return
    }

    if (!scriptsLoaded.jspdf || !scriptsLoaded.dompurify) {
      alert("PDF libraries are still loading. Please wait a moment and try again.")
      return
    }

    setIsGenerating(true)
    setShowSuccess(false)

    try {
      // Import marked for Markdown to HTML conversion
      const marked = await import("marked")
      marked.marked.setOptions({
        breaks: true,
        gfm: true,
      })

      // Convert markdown to HTML
      const htmlContent = marked.marked.parse(markdownContent)
      
      // Sanitize HTML content for security
      const sanitizedHtml = window.DOMPurify.sanitize(htmlContent)

      // Create a styled container for the content
      const contentContainer = document.createElement("div")
      contentContainer.innerHTML = sanitizedHtml
      contentContainer.id = "pdf-content"
      contentContainer.style.fontSize = "12pt"
      contentContainer.style.lineHeight = "1.6"
      contentContainer.style.fontFamily = "Arial, sans-serif"
      contentContainer.style.color = "#000"
      contentContainer.style.padding = "20px"
      contentContainer.style.maxWidth = "800px"
      contentContainer.style.margin = "0 auto"

      // Style headings
      const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        heading.style.marginTop = '16px'
        heading.style.marginBottom = '8px'
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
        const pre = block.parentElement
        if (pre) {
          pre.style.backgroundColor = '#f5f5f5'
          pre.style.padding = '10px'
          pre.style.borderRadius = '4px'
          pre.style.overflow = 'auto'
          pre.style.marginBottom = '10px'
          pre.style.fontFamily = 'Courier, monospace'
          pre.style.fontSize = '10pt'
          pre.style.whiteSpace = 'pre-wrap'
        }
      })

      // Style inline code
      const inlineCodes = contentContainer.querySelectorAll('code:not(pre code)')
      inlineCodes.forEach(code => {
        code.style.backgroundColor = '#f5f5f5'
        code.style.padding = '2px 4px'
        code.style.borderRadius = '4px'
        code.style.fontFamily = 'Courier, monospace'
        code.style.fontSize = '10pt'
      })

      // Hide the container temporarily while we generate the PDF
      contentContainer.style.position = "absolute"
      contentContainer.style.left = "-9999px"
      document.body.appendChild(contentContainer)

      // Make sure jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF not loaded properly")
      }

      // Initialize jsPDF
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      })

      // Use html2pdf.js for better text handling
      if (window.html2pdf) {
        const opt = {
          margin: [40, 40, 40, 40],
          filename: `${filename || "document"}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }
        
        await window.html2pdf().from(contentContainer).set(opt).save()
        setShowSuccess(true)
      } else {
        // Fallback to using jsPDF directly with html method
        // Only works if the html plugin is loaded
        if (typeof doc.html === 'function') {
          await doc.html(contentContainer, {
            callback: function (pdf) {
              pdf.save(`${filename || "document"}.pdf`)
              setShowSuccess(true)
            },
            margin: [40, 40, 40, 40],
            autoPaging: 'text',
            x: 0,
            y: 0,
            width: doc.internal.pageSize.getWidth() - 80,
            windowWidth: 800
          })
        } else {
          throw new Error("PDF HTML plugin not loaded properly")
        }
      }

      // Clean up
      document.body.removeChild(contentContainer)
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
        disabled={isGenerating || !scriptsLoaded.jspdf}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
        id="generatePdfBtn"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner />
            Creating PDF...
          </>
        ) : !scriptsLoaded.jspdf ? (
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
    DOMPurify: any
    html2pdf: any
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

