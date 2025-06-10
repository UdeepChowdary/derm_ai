"use client"

import { useEffect, useRef } from "react"

export function LoadingLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scanAnimationRef = useRef<SVGGElement>(null)
  const scanLineRef = useRef<SVGLineElement>(null)

  // Size mapping
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  }

  useEffect(() => {
    // Animation for the magnifying glass scanning
    const scanGroup = scanAnimationRef.current
    const scanLine = scanLineRef.current

    if (!scanGroup || !scanLine) return

    // Initial position
    let direction = 1
    let position = 0
    const speed = 0.7
    const maxPosition = 50

    const animate = () => {
      position += speed * direction

      // Change direction when reaching the edges
      if (position >= maxPosition || position <= 0) {
        direction *= -1
      }

      // Update the position of the magnifying glass
      scanGroup.setAttribute("transform", `translate(${position}, 0)`)

      // Update the scan line opacity to create a pulsing effect
      const opacity = 0.5 + Math.sin(position / 5) * 0.3
      scanLine.setAttribute("opacity", opacity.toString())

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className={`relative ${sizeMap[size]} flex items-center justify-center mx-auto`}>
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(45,212,191,0.3) 0%, rgba(45,212,191,0) 70%)",
          transform: "scale(1.2)",
        }}
      ></div>
      <div className="relative flex items-center justify-center w-full h-full">
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loadingLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4fd1c5" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            <radialGradient id="loadingSkinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffe8d6" />
              <stop offset="100%" stopColor="#ddbea9" />
            </radialGradient>

            <radialGradient id="loadingSkinGradientZoomed" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffead6" />
              <stop offset="100%" stopColor="#e5c2a5" />
            </radialGradient>

            <filter id="loadingGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <clipPath id="loadingMagnifyingGlassClip">
              <circle cx="75" cy="75" r="30" />
            </clipPath>

            {/* Scanning animation mask */}
            <mask id="loadingScanMask">
              <rect x="0" y="0" width="200" height="200" fill="white" />
              <circle cx="75" cy="75" r="30" fill="black" />
            </mask>
          </defs>

          {/* Glowing outer ring */}
          <circle
            cx="100"
            cy="100"
            r="98"
            fill="none"
            stroke="url(#loadingLogoGradient)"
            strokeWidth="4"
            filter="url(#loadingGlow)"
          />

          {/* Main circle */}
          <circle cx="100" cy="100" r="98" fill="white" stroke="url(#loadingLogoGradient)" strokeWidth="4" />

          {/* Skin background - circular */}
          <circle cx="100" cy="100" r="80" fill="url(#loadingSkinGradient)" />

          {/* Scanning effect overlay */}
          <rect x="20" y="20" width="160" height="160" fill="none" mask="url(#loadingScanMask)">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="1.5s" repeatCount="indefinite" />
          </rect>

          {/* Magnifying glass group that will be animated */}
          <g ref={scanAnimationRef}>
            {/* Magnifying glass handle */}
            <line
              x1="95"
              y1="105"
              x2="135"
              y2="145"
              stroke="url(#loadingLogoGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Magnifying glass rim */}
            <circle cx="75" cy="75" r="30" fill="none" stroke="url(#loadingLogoGradient)" strokeWidth="8" />

            {/* Zoomed skin under magnifying glass */}
            <g clipPath="url(#loadingMagnifyingGlassClip)">
              <circle cx="75" cy="75" r="30" fill="url(#loadingSkinGradientZoomed)" />

              {/* Digital grid overlay to show AI analysis */}
              <line
                x1="45"
                y1="60"
                x2="105"
                y2="60"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />
              <line
                x1="45"
                y1="75"
                x2="105"
                y2="75"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />
              <line
                x1="45"
                y1="90"
                x2="105"
                y2="90"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />

              <line
                x1="60"
                y1="45"
                x2="60"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />
              <line
                x1="75"
                y1="45"
                x2="75"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />
              <line
                x1="90"
                y1="45"
                x2="90"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.3"
              />

              {/* Scanning line */}
              <line ref={scanLineRef} x1="45" y1="75" x2="105" y2="75" stroke="#0d9488" strokeWidth="2" opacity="0.5">
                <animate attributeName="y1" values="45;105;45" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="y2" values="45;105;45" dur="1.5s" repeatCount="indefinite" />
              </line>
            </g>

            {/* Magnifying glass sheen/highlight */}
            <path d="M60,65 Q75,60 90,70" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
          </g>
        </svg>
      </div>
    </div>
  )
}
