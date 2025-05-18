"use client"

import { useState } from "react"

interface PdfGeneratorProps {
  markdownContent: string
  filename: string
  apiKey: string
}

export function PdfGenerator({ markdownContent, filename, apiKey }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const generatePdf = async () => {
    if (!markdownContent.trim()) {
      alert("Please enter some markdown content.")
      return
    }

    if (!apiKey) {
      alert("API key is required.")
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
      
      // Create HTML document with proper styling
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename || "Document"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              margin: 0;
              padding: 20px;
              font-size: 12pt;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 16px;
              margin-bottom: 8px;
              font-weight: bold;
            }
            h1 { font-size: 24pt; }
            h2 { font-size: 20pt; }
            h3 { font-size: 16pt; }
            h4 { font-size: 14pt; }
            h5 { font-size: 12pt; }
            h6 { font-size: 11pt; }
            ul, ol {
              padding-left: 20px;
              margin-bottom: 10px;
            }
            blockquote {
              border-left: 4px solid #ccc;
              padding-left: 15px;
              margin-left: 0;
              font-style: italic;
            }
            pre {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              overflow: auto;
              margin-bottom: 10px;
              font-family: "Courier New", monospace;
              font-size: 10pt;
              white-space: pre-wrap;
            }
            code {
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 4px;
              font-family: "Courier New", monospace;
              font-size: 10pt;
            }
            .page {
              page-break-after: always;
              page-break-inside: avoid;
            }
            a {
              color: #0066cc;
              text-decoration: underline;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 16px;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `

      // Use the html2pdf.app API to generate PDF with selectable text
      const response = await fetch('https://api.html2pdf.app/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: fullHtml,
          apiKey: apiKey,
          format: 'A4',
          filename: `${filename || "document"}.pdf`,
          marginTop: 40,
          marginRight: 40,
          marginBottom: 40,
          marginLeft: 40
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `API error: ${response.status}`)
      }

      // Get the PDF as a blob and download it
      const pdfBlob = await response.blob()
      const url = window.URL.createObjectURL(pdfBlob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename || "document"}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
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
