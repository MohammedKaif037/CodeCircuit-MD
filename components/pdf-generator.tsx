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

      // Style headings specifically to prevent page breaks
      const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        heading.style.marginTop = '20px'
        heading.style.marginBottom = '10px'
        heading.style.fontWeight = 'bold'
        heading.style.pageBreakBefore = 'always' // Force headings to start on a new page if needed
        heading.style.pageBreakAfter = 'avoid' // Prevent page break after heading
        heading.style.pageBreakInside = 'avoid' // Prevent page break inside heading
        // Modern CSS equivalents
        heading.style.breakBefore = 'page' 
        heading.style.breakAfter = 'avoid'
        heading.style.breakInside = 'avoid'
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
      
      // Instead of using html2canvas for the entire content at once,
      // we'll break the content into sections based on headings to prevent page breaks within headings
      
      // Get all heading elements to use as section breaks
      const headingElements = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const sections = [];
      
      // If we have headings, use them to divide the content
      if (headingElements.length > 0) {
        // Create sections based on headings
        headingElements.forEach((heading, index) => {
          const sectionDiv = document.createElement('div');
          sectionDiv.style.pageBreakInside = 'avoid'; // CSS hint to avoid breaking inside a section
          sectionDiv.style.breakInside = 'avoid'; // Modern browsers
          sectionDiv.appendChild(heading.cloneNode(true));
          
          // Add all content until next heading
          let nextElement = heading.nextElementSibling;
          while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
            sectionDiv.appendChild(nextElement.cloneNode(true));
            nextElement = nextElement.nextElementSibling;
          }
          
          sections.push(sectionDiv);
        });
      } else {
        // If no headings, treat the whole content as one section
        sections.push(contentContainer);
      }
      
      // Set up PDF document
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 20; // 10mm margins on each side
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentHeight = pageHeight - 20; // 10mm margins top and bottom
      
      let yPosition = 10; // Start position from top with margin
      let currentPage = 1;
      
      // Process each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        document.body.appendChild(section);
        
        // Check if we need to add a page
        if (i > 0 && yPosition > pageHeight * 0.75) {
          doc.addPage();
          currentPage++;
          yPosition = 10;
        }
        
        // Get section dimensions
        const sectionHeight = section.offsetHeight;
        
        // Check if the section might be too large for one page
        if (sectionHeight > contentHeight * 0.9) {
          // For large sections, use piecemeal approach
          const canvas = await window.html2canvas(section, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // If section won't fit on current page, add a new page
          if (yPosition + imgHeight > pageHeight - 10) {
            doc.addPage();
            currentPage++;
            yPosition = 10;
          }
          
          doc.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5; // Add some spacing
        } else {
          // For smaller sections that should fit on one page
          const canvas = await window.html2canvas(section, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // If section won't fit on current page, add a new page
          if (yPosition + imgHeight > pageHeight - 10) {
            doc.addPage();
            currentPage++;
            yPosition = 10;
          }
          
          doc.addImage(imgData, 'JPEG', 10, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5; // Add some spacing
        }
        
        document.body.removeChild(section);
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
