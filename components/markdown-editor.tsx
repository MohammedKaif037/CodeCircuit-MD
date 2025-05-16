"use client"

import { useState, useRef } from "react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [headingLevel, setHeadingLevel] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Function to format selected text
  const formatSelectedText = (prefix: string, placeholder = "", suffix = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newValue = value.substring(0, start) + prefix + (selectedText || placeholder) + suffix + value.substring(end)

    onChange(newValue)

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + (selectedText || placeholder).length,
        )
      }
    }, 0)
  }

  // Function to cycle through heading levels
  const cycleHeading = () => {
    const newLevel = (headingLevel % 6) + 1
    setHeadingLevel(newLevel)

    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const currentLineStart = value.lastIndexOf("\n", cursorPosition - 1) + 1
    const currentLine = value.substring(currentLineStart, cursorPosition)

    // Check if the current line starts with a heading
    const newHeadingPrefix = "#".repeat(newLevel) + " "

    // Replace or insert the new heading
    const newValue =
      value.substring(0, currentLineStart) + newHeadingPrefix + "Heading Text" + value.substring(cursorPosition)

    onChange(newValue)

    // Move cursor to end of "Heading Text"
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(
          currentLineStart + newHeadingPrefix.length,
          currentLineStart + newHeadingPrefix.length + "Heading Text".length,
        )
      }
    }, 0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-lg shadow-sm p-2 mb-4 flex flex-wrap gap-2">
        <FormatButton onClick={cycleHeading} label={`H${headingLevel}`} />
        <FormatButton onClick={() => formatSelectedText("**", "bold text", "**")} label="B" />
        <FormatButton onClick={() => formatSelectedText("*", "italic text", "*")} label="I" />
        <FormatButton onClick={() => formatSelectedText("> ", "blockquote")} label="Quote" />
        <FormatButton onClick={() => formatSelectedText("1. ", "list item")} label="1." />
        <FormatButton onClick={() => formatSelectedText("- ", "list item")} label="•" />
        <FormatButton onClick={() => formatSelectedText("`", "code", "`")} label="Code" />
        <FormatButton onClick={() => formatSelectedText("---\n", "")} label="HR" />
        <FormatButton onClick={() => formatSelectedText("[", "link text", "](https://example.com)")} label="Link" />
        <FormatButton
          onClick={() => formatSelectedText("![", "alt text", "](/placeholder.svg?height=200&width=300)")}
          label="Image"
        />
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="# Start writing your markdown here..."
      />
    </div>
  )
}

interface FormatButtonProps {
  onClick: () => void
  label: string
}

function FormatButton({ onClick, label }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium"
    >
      {label}
    </button>
  )
}
