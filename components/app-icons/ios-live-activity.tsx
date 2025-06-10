"use client"

import { useEffect, useRef } from "react"

interface iOSLiveActivityProps {
  size?: number
  darkMode?: boolean
  className?: string
}

export function IOSLiveActivity({ size = 200, darkMode = false, className = "" }: iOSLiveActivityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = size
    canvas.height = size / 3

    // Animation variables
    let animationFrame: number
    let position = 0
    let direction = 1
    const speed = 0.3
    const maxPosition = size / 20

    // Draw the Live Activity
    const drawLiveActivity = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      ctx.fillStyle = darkMode ? "#1c1c1e" : "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Rounded corners
      const radius = size / 12
      ctx.fillStyle = darkMode ? "#000000" : "#f5f5f7"
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, radius)
      ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, radius)
      ctx.arcTo(0, canvas.height, 0, 0, radius)
      ctx.arcTo(0, 0, canvas.width, 0, radius)
      ctx.fill()

      // App icon
      const iconSize = canvas.height * 0.7
      const iconX = iconSize / 2 + 10
      const iconY = canvas.height / 2

      // Draw app icon background
      ctx.beginPath()
      ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = iconSize / 25
      ctx.stroke()

      // Draw skin circle
      ctx.beginPath()
      ctx.arc(iconX, iconY, (iconSize / 2) * 0.8, 0, Math.PI * 2)
      ctx.fillStyle = "#ffe8d6"
      ctx.fill()

      // Draw magnifying glass with animation
      const glassX = iconX - iconSize / 6 + position
      const glassY = iconY - iconSize / 6
      const glassRadius = iconSize / 5

      // Draw magnifying glass rim
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = iconSize / 25
      ctx.stroke()

      // Draw magnifying glass handle
      ctx.beginPath()
      ctx.moveTo(glassX + glassRadius * 0.7, glassY + glassRadius * 0.7)
      ctx.lineTo(glassX + glassRadius * 1.5, glassY + glassRadius * 1.5)
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = iconSize / 25
      ctx.lineCap = "round"
      ctx.stroke()

      // Draw text
      ctx.fillStyle = darkMode ? "#ffffff" : "#000000"
      ctx.font = `${size / 15}px sans-serif`
      ctx.textBaseline = "middle"
      ctx.fillText("Analyzing skin condition...", iconX + iconSize / 2 + 15, canvas.height / 2)

      // Draw progress bar
      const progressWidth = canvas.width - (iconX + iconSize / 2 + 15) - 20
      const progressHeight = size / 30
      const progressY = canvas.height / 2 + size / 20

      ctx.fillStyle = darkMode ? "#333333" : "#e0e0e0"
      ctx.beginPath()
      ctx.roundRect(iconX + iconSize / 2 + 15, progressY, progressWidth, progressHeight, progressHeight / 2)
      ctx.fill()

      // Animated progress
      const progress = ((Math.sin((position / maxPosition) * Math.PI) + 1) / 2) * 0.75 + 0.1
      ctx.fillStyle = "#14b8a6"
      ctx.beginPath()
      ctx.roundRect(iconX + iconSize / 2 + 15, progressY, progressWidth * progress, progressHeight, progressHeight / 2)
      ctx.fill()

      // Update animation position
      position += speed * direction
      if (position >= maxPosition || position <= 0) {
        direction *= -1
      }

      // Continue animation loop
      animationFrame = requestAnimationFrame(drawLiveActivity)
    }

    // Start animation
    drawLiveActivity()

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [size, darkMode])

  return <canvas ref={canvasRef} width={size} height={size / 3} className={`rounded-2xl shadow-lg ${className}`} />
}
