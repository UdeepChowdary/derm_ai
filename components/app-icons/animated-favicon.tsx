"use client"

import { useEffect, useRef } from "react"
import Head from "next/head"

export function AnimatedFavicon() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 32
    canvas.height = 32

    // Create favicon link element
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }

    // Animation variables
    let animationFrame: number
    let position = 0
    let direction = 1
    const speed = 0.3
    const maxPosition = 6

    // Draw the favicon frame
    const drawFavicon = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background circle
      ctx.beginPath()
      ctx.arc(16, 16, 15, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw skin circle
      ctx.beginPath()
      ctx.arc(16, 16, 12, 0, Math.PI * 2)
      ctx.fillStyle = "#ffe8d6"
      ctx.fill()

      // Draw magnifying glass with animation
      const glassX = 12 + position
      const glassY = 12
      const glassRadius = 6

      // Draw magnifying glass rim
      ctx.beginPath()
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw magnifying glass handle
      ctx.beginPath()
      ctx.moveTo(glassX + glassRadius * 0.7, glassY + glassRadius * 0.7)
      ctx.lineTo(glassX + glassRadius * 2, glassY + glassRadius * 2)
      ctx.strokeStyle = "#14b8a6"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.stroke()

      // Convert canvas to data URL and update favicon
      link.href = canvas.toDataURL("image/png")

      // Update animation position
      position += speed * direction
      if (position >= maxPosition || position <= 0) {
        direction *= -1
      }

      // Continue animation loop
      animationFrame = requestAnimationFrame(drawFavicon)
    }

    // Start animation
    drawFavicon()

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <>
      <Head>
        {/* This is just a placeholder, the actual favicon is set via JavaScript */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  )
}
