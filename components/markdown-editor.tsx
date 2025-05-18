'use client'

import { useState, useRef, useEffect } from "react"
import { FiBold, FiItalic, FiCode, FiLink, FiImage, FiList, FiQuote } from "react-icons/fi"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [headingLevel, setHeadingLevel] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isGlitching, setIsGlitching] = useState(false)

  const formatText = (prefix: string, suffix = '', placeholder = '') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newValue = 
      value.substring(0, start) + 
      prefix + 
      (selectedText || placeholder) + 
      suffix + 
      value.substring(end)

    onChange(newValue)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + (selectedText || placeholder).length
        )
      }
    }, 0)
  }

  const cycleHeading = () => {
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 500)
    
    const newLevel = headingLevel % 6 + 1
    setHeadingLevel(newLevel)
    formatText('#'.repeat(newLevel) + ' ', '', 'Heading')
  }

  const buttons = [
    { icon: <FiBold />, action: () => formatText('**', '**', 'bold text') },
    { icon: <FiItalic />, action: () => formatText('*', '*', 'italic text') },
    { icon: <FiCode />, action: () => formatText('`', '`', 'code') },
    { icon: <FiLink />, action: () => formatText('[', '](url)', 'link text') },
    { icon: <FiImage />, action: () => formatText('![', '](image-url)', 'alt text') },
    { icon: <FiList />, action: () => formatText('- ', '', 'list item') },
    { icon: <FiQuote />, action: () => formatText('> ', '', 'quote') },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cybercyan rounded-lg p-3 mb-4 flex flex-wrap gap-2 border-2 border-black shadow-cyber">
        <button
          onClick={cycleHeading}
          className={`cassette-btn px-4 py-2 bg-pink-100 hover:bg-cyberpurple text-cyberblue 
                    font-bold shadow-cyber flex items-center gap-1 ${isGlitching ? 'glitch-text' : ''}`}
        >
          <span className="text-lg">H{headingLevel}</span>
        </button>
        
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="cassette-btn p-2 bg-pink-100 hover:bg-cyberpurple text-cyberblue 
                      font-bold shadow-cyber flex items-center justify-center"
          >
            {btn.icon}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 p-4 rounded-lg bg-pink-100 border-2 border-black shadow-cyber 
                  focus:shadow-cyber-lg focus:outline-none font-bold text-cyberblue
                  placeholder-cyberblue/50 resize-none font-mono"
        placeholder=">_ ENTER CYBERNOTES HERE..."
      />
    </div>
  )
}
