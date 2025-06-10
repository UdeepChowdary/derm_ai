"use client"

import { FC } from "react"

interface SkipToContentProps {
  targetId?: string
  children?: React.ReactNode
}

export const SkipToContent: FC<SkipToContentProps> = ({ 
  targetId = "main-content",
  children = "Skip to content" 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    
    if (target) {
      // Set tabindex to ensure element is focusable
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1")
      }
      
      target.focus()
      
      // Scroll to the element
      target.scrollIntoView()
    }
  }

  return (
    <a 
      href={`#${targetId}`}
      className="skip-to-content"
      onClick={handleClick}
    >
      {children}
    </a>
  )
} 