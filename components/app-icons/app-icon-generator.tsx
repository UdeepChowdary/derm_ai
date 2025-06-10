"use client"

import { useEffect, useRef } from "react"

interface AppIconGeneratorProps {
  size?: number
  animated?: boolean
  frameRate?: number
  onGenerate?: (dataUrl: string) => void
}

export function AppIconGenerator({ size = 512, animated = true, frameRate = 30, onGenerate }: AppIconGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = size
    canvas.height = size

    // Animation variables
    let animationFrame: number
    let position = 0
    let direction = 1
    const speed = animated ? 0.5 : 0
    const maxPosition = size / 20
    let lastFrameTime = 0
    const frameDuration = 1000 / frameRate

    // Draw the app icon frame
    const drawIcon = (timestamp: number) => {
      // Throttle frame rate
      if (animated && timestamp - lastFrameTime < frameDuration) {
        animationFrame = requestAnimationFrame(drawIcon)
        return
      }
      lastFrameTime = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate dimensions based on size
      const centerX = size / 2
      const centerY = size / 2
      const outerRadius = size / 2 - 2
      const innerRadius = outerRadius * 0.8
      const glassRadius = innerRadius * 0.4
      const strokeWidth = size / 50

      // Draw outer circle with gradient
      const outerGradient = ctx.createLinearGradient(0, 0, size, size)
      outerGradient.addColorStop(0, "#4fd1c5")
      outerGradient.addColorStop(1, "#0d9488")

      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.strokeStyle = outerGradient
      ctx.lineWidth = strokeWidth
      ctx.stroke()

      // Draw skin circle with gradient
      const skinGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius)
      skinGradient.addColorStop(0, "#ffe8d6")
      skinGradient.addColorStop(1, "#ddbea9")

      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
      ctx.fillStyle = skinGradient
      ctx.fill()

      // Draw magnifying glass with animation
      const glassX = centerX - innerRadius * 0.3 + position
      const glassY = centerY - innerRadius * 0.3

      // Draw magnifying glass rim
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2)
      ctx.strokeStyle = outerGradient
      ctx.lineWidth = strokeWidth * 1.5
      ctx.stroke()

      // Draw magnifying glass handle
      ctx.beginPath()
      ctx.moveTo(glassX + glassRadius * 0.7, glassY + glassRadius * 0.7)
      ctx.lineTo(glassX + glassRadius * 2, glassY + glassRadius * 2)
      ctx.strokeStyle = outerGradient
      ctx.lineWidth = strokeWidth * 1.5
      ctx.lineCap = "round"
      ctx.stroke()

      // Add subtle grid pattern inside magnifying glass
      ctx.save()
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius - strokeWidth / 2, 0, Math.PI * 2)
      ctx.clip()

      // Draw horizontal grid lines
      for (let i = -glassRadius; i <= glassRadius; i += glassRadius / 3) {
        ctx.beginPath()
        ctx.moveTo(glassX - glassRadius, glassY + i)
        ctx.lineTo(glassX + glassRadius, glassY + i)
        ctx.strokeStyle = "rgba(13, 148, 136, 0.2)"
        ctx.lineWidth = strokeWidth * 0.2
        ctx.setLineDash([strokeWidth * 0.3, strokeWidth * 0.3])
        ctx.stroke()
      }

      // Draw vertical grid lines
      for (let i = -glassRadius; i <= glassRadius; i += glassRadius / 3) {
        ctx.beginPath()
        ctx.moveTo(glassX + i, glassY - glassRadius)
        ctx.lineTo(glassX + i, glassY + glassRadius)
        ctx.strokeStyle = "rgba(13, 148, 136, 0.2)"
        ctx.lineWidth = strokeWidth * 0.2
        ctx.stroke()
      }

      // Draw scanning line
      ctx.beginPath()
      ctx.moveTo(glassX - glassRadius, glassY)
      ctx.lineTo(glassX + glassRadius, glassY)
      ctx.strokeStyle = "rgba(13, 148, 136, 0.5)"
      ctx.lineWidth = strokeWidth * 0.4
      ctx.setLineDash([])
      ctx.stroke()

      ctx.restore()

      // Add subtle highlight
      ctx.beginPath()
      ctx.moveTo(glassX - glassRadius * 0.5, glassY - glassRadius * 0.3)
      ctx.quadraticCurveTo(glassX, glassY - glassRadius * 0.8, glassX + glassRadius * 0.5, glassY - glassRadius * 0.3)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
      ctx.lineWidth = strokeWidth * 0.4
      ctx.stroke()

      // Update animation position
      if (animated) {
        position += speed * direction
        if (position >= maxPosition || position <= 0) {
          direction *= -1
        }
      }

      // Generate data URL if needed
      if (onGenerate && !animated) {
        onGenerate(canvas.toDataURL("image/png"))
      }

      // Continue animation loop if animated
      if (animated) {
        animationFrame = requestAnimationFrame(drawIcon)
      }
    }

    // Start drawing
    if (animated) {
      animationFrame = requestAnimationFrame(drawIcon)
    } else {
      drawIcon(0)
    }

    // Cleanup on unmount
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [size, animated, frameRate, onGenerate])

  return <canvas ref={canvasRef} width={size} height={size} className="w-full h-full" />
}
