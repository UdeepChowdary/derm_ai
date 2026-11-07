import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 24,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "2px solid #0d9488",
        boxShadow: "0 0 10px rgba(45,212,191,0.5)",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4fd1c5" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <radialGradient id="faviconSkinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ffe8d6" />
            <stop offset="100%" stopColor="#ddbea9" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="80" fill="#ffe8d6" />
        <circle cx="75" cy="75" r="30" fill="none" stroke="#0d9488" strokeWidth="8" />
        <line x1="95" y1="105" x2="135" y2="145" stroke="#0d9488" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </div>,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse height and width.
      ...size,
    },
  )
}
