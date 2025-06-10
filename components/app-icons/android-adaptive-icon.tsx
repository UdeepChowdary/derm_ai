"use client"

import { useEffect, useRef } from "react"

interface AndroidAdaptiveIconProps {
  size?: number
  animated?: boolean
  className?: string
}

export function AndroidAdaptiveIcon({ size = 200, animated = true, className = "" }: AndroidAdaptiveIconProps) {
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
    const speed = 0.3
    const maxPosition = size / 20

    // Draw the Adaptive Icon
    const drawAdaptiveIcon = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = size / 2
      const centerY = size / 2
      const radius = size * 0.4

      // Draw background layer (static)
      // This would be a separate layer in the actual Android implementation
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.45)
      gradient.addColorStop(0, "#e6fffa")
      gradient.addColorStop(1, "#99f6e4")
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw skin circle (static)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      const skinGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      skinGradient.addColorStop(0, "#ffe8d6")
      skinGradient.addColorStop(1, "#ddbea9")
      ctx.fillStyle = skinGradient
      ctx.fill()

      // Draw foreground layer (animated)
      // This would be the animated layer in the actual Android implementation

      // Draw magnifying glass with animation
      const glassX = centerX - radius * 0.3 + (animated ? position : 0)
      const glassY = centerY - radius * 0.3
      const glassRadius = radius * 0.4

      // Draw magnifying glass rim
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "#0d9488"
      ctx.lineWidth = size / 25
      ctx.stroke()

      // Draw magnifying glass handle
      ctx.beginPath()
      ctx.moveTo(glassX + glassRadius * 0.7, glassY + glassRadius * 0.7)
      ctx.lineTo(glassX + glassRadius * 1.5, glassY + glassRadius * 1.5)
      ctx.strokeStyle = "#0d9488"
      ctx.lineWidth = size / 25
      ctx.lineCap = "round"
      ctx.stroke()

      // Add subtle grid pattern inside magnifying glass
      ctx.save()
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius - size / 50, 0, Math.PI * 2)
      ctx.clip()

      // Draw horizontal grid lines
      for (let i = -glassRadius; i <= glassRadius; i += glassRadius / 3) {
        ctx.beginPath()
        ctx.moveTo(glassX - glassRadius, glassY + i)
        ctx.lineTo(glassX + glassRadius, glassY + i)
        ctx.strokeStyle = "rgba(13, 148, 136, 0.2)"
        ctx.lineWidth = size / 100
        ctx.setLineDash([size / 100, size / 100])
        ctx.stroke()
      }

      // Draw vertical grid lines
      for (let i = -glassRadius; i <= glassRadius; i += glassRadius / 3) {
        ctx.beginPath()
        ctx.moveTo(glassX + i, glassY - glassRadius)
        ctx.lineTo(glassX + i, glassY + glassRadius)
        ctx.strokeStyle = "rgba(13, 148, 136, 0.2)"
        ctx.lineWidth = size / 100
        ctx.stroke()
      }

      // Draw scanning line
      ctx.beginPath()
      ctx.moveTo(glassX - glassRadius, glassY)
      ctx.lineTo(glassX + glassRadius, glassY)
      ctx.strokeStyle = "rgba(13, 148, 136, 0.5)"
      ctx.lineWidth = size / 50
      ctx.setLineDash([])
      ctx.stroke()

      ctx.restore()

      // Update animation position
      if (animated) {
        position += speed * direction
        if (position >= maxPosition || position <= 0) {
          direction *= -1
        }

        // Continue animation loop
        animationFrame = requestAnimationFrame(drawAdaptiveIcon)
      }
    }

    // Start drawing
    drawAdaptiveIcon()

    // Cleanup on unmount
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [size, animated])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />

      {/* Show Android adaptive icon shape overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-slate-400 opacity-30" />
        <div className="absolute w-[90%] h-[90%] rounded-[40px] border-2 border-dashed border-slate-400 opacity-30" />
        <div className="absolute w-[90%] aspect-square rounded-[40px] border-2 border-dashed border-slate-400 opacity-30" />
        <div className="absolute w-[90%] h-[90%] rounded-[25%] border-2 border-dashed border-slate-400 opacity-30" />
      </div>
    </div>
  )
}
