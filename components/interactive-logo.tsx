"use client"

import { useEffect, useRef, useState } from "react"

interface InteractiveLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function InteractiveLogo({ size = "md", className = "" }: InteractiveLogoProps) {
  const scanAnimationRef = useRef<SVGGElement>(null)
  const scanLineRef = useRef<SVGLineElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(0.7)

  // Size mapping
  const sizeMap = {
    sm: "w-12 h-12",
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
    const maxPosition = 50
    let animationId: number

    const animate = () => {
      // Adjust speed based on interaction state
      const currentSpeed = isHovering ? animationSpeed * 1.5 : animationSpeed

      position += currentSpeed * direction

      // Change direction when reaching the edges
      if (position >= maxPosition || position <= 0) {
        direction *= -1
      }

      // Update the position of the magnifying glass
      scanGroup.setAttribute("transform", `translate(${position}, 0)`)

      // Update the scan line opacity to create a pulsing effect
      const baseOpacity = isHovering ? 0.7 : 0.5
      const opacityVariation = isHovering ? 0.2 : 0.3
      const opacity = baseOpacity + Math.sin(position / 5) * opacityVariation
      scanLine.setAttribute("opacity", opacity.toString())

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isHovering, animationSpeed])

  // Handle tap/click with ripple effect
  const handleTap = () => {
    setIsPressed(true)

    // Double tap detection
    const now = Date.now()
    if (now - lastTapTime < 300) {
      // Double tap detected - increase animation speed temporarily
      setAnimationSpeed(1.5)
      setTimeout(() => setAnimationSpeed(0.7), 1000)
    }
    setLastTapTime(now)

    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 300)
  }

  return (
    <div
      ref={logoRef}
      className={`relative ${sizeMap[size]} ${className} cursor-pointer transition-transform duration-300 ${
        isHovering ? "scale-110" : ""
      } ${isPressed ? "scale-95" : ""} flex items-center justify-center`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleTap}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Ripple effect on click */}
      {isPressed && (
        <div className="absolute inset-0 z-10 rounded-full animate-ripple">
          <div
            className="absolute inset-0 rounded-full bg-teal-300 dark:bg-teal-700 opacity-30"
            style={{
              animation: "ripple 0.6s linear forwards",
            }}
          />
        </div>
      )}

      <div
        className={`absolute inset-0 rounded-full ${isHovering ? "animate-pulse-fast" : "animate-pulse"}`}
        style={{
          background: `radial-gradient(circle, rgba(45,212,191,${isHovering ? "0.4" : "0.3"}) 0%, rgba(45,212,191,0) 70%)`,
          transform: isHovering ? "scale(1.3)" : "scale(1.2)",
          transition: "transform 0.3s ease, background 0.3s ease",
        }}
      ></div>

      <div className="relative flex items-center justify-center w-full h-full">
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="interactiveLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isHovering ? "#2dd4bf" : "#4fd1c5"} />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            <radialGradient id="interactiveSkinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffe8d6" />
              <stop offset="100%" stopColor="#ddbea9" />
            </radialGradient>

            <radialGradient id="interactiveSkinGradientZoomed" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffead6" />
              <stop offset="100%" stopColor="#e5c2a5" />
            </radialGradient>

            <filter id="interactiveGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isHovering ? "5" : "4"} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <clipPath id="interactiveMagnifyingGlassClip">
              <circle cx="75" cy="75" r="30" />
            </clipPath>

            <mask id="interactiveScanMask">
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
            stroke="url(#interactiveLogoGradient)"
            strokeWidth={isHovering ? "5" : "4"}
            filter="url(#interactiveGlow)"
          />

          {/* Main circle */}
          <circle
            cx="100"
            cy="100"
            r="98"
            fill="white"
            stroke="url(#interactiveLogoGradient)"
            strokeWidth={isHovering ? "5" : "4"}
          />

          {/* Skin background - circular */}
          <circle cx="100" cy="100" r="80" fill="url(#interactiveSkinGradient)" />

          {/* Scanning effect overlay */}
          <rect x="20" y="20" width="160" height="160" fill="none" mask="url(#interactiveScanMask)">
            <animate
              attributeName="opacity"
              values={isHovering ? "0.2;0.4;0.2" : "0.1;0.3;0.1"}
              dur={isHovering ? "1.2s" : "1.5s"}
              repeatCount="indefinite"
            />
          </rect>

          {/* Magnifying glass group that will be animated */}
          <g ref={scanAnimationRef}>
            {/* Magnifying glass handle */}
            <line
              x1="95"
              y1="105"
              x2="135"
              y2="145"
              stroke="url(#interactiveLogoGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Magnifying glass rim */}
            <circle
              cx="75"
              cy="75"
              r="30"
              fill="none"
              stroke="url(#interactiveLogoGradient)"
              strokeWidth={isHovering ? "9" : "8"}
            />

            {/* Zoomed skin under magnifying glass */}
            <g clipPath="url(#interactiveMagnifyingGlassClip)">
              <circle cx="75" cy="75" r="30" fill="url(#interactiveSkinGradientZoomed)" />

              {/* Digital grid overlay to show AI analysis */}
              <line
                x1="45"
                y1="60"
                x2="105"
                y2="60"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />
              <line
                x1="45"
                y1="75"
                x2="105"
                y2="75"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />
              <line
                x1="45"
                y1="90"
                x2="105"
                y2="90"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />

              <line
                x1="60"
                y1="45"
                x2="60"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />
              <line
                x1="75"
                y1="45"
                x2="75"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />
              <line
                x1="90"
                y1="45"
                x2="90"
                y2="105"
                stroke="#0d9488"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={isHovering ? "0.4" : "0.3"}
              />

              {/* Scanning line */}
              <line
                ref={scanLineRef}
                x1="45"
                y1="75"
                x2="105"
                y2="75"
                stroke="#0d9488"
                strokeWidth={isHovering ? "2.5" : "2"}
                opacity="0.5"
              >
                <animate
                  attributeName="y1"
                  values="45;105;45"
                  dur={isHovering ? "1.2s" : "1.5s"}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y2"
                  values="45;105;45"
                  dur={isHovering ? "1.2s" : "1.5s"}
                  repeatCount="indefinite"
                />
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
