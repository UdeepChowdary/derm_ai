"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type AccessibilitySettings = {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  focusVisible: boolean
  lineSpacing: "normal" | "wide" | "wider"
  letterSpacing: "normal" | "wide" | "wider"
  // Audio accessibility settings
  textToSpeech: boolean
  audioFeedback: boolean
  voiceCommands: boolean
  audioPlaybackSpeed: "normal" | "slow" | "slower"
  audioVolume: "normal" | "loud" | "louder"
}

type AccessibilityContextType = {
  settings: AccessibilitySettings
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void
  resetSettings: () => void
  speakText: (text: string, priority?: boolean) => void
  stopSpeaking: () => void
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  focusVisible: true,
  lineSpacing: "normal",
  letterSpacing: "normal",
  // Default audio settings
  textToSpeech: false,
  audioFeedback: false,
  voiceCommands: false,
  audioPlaybackSpeed: "normal",
  audioVolume: "normal"
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [speechQueue, setSpeechQueue] = useState<{ text: string; priority: boolean }[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Initialize speech synthesis when available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }, [])

  // Check for user's prefers-reduced-motion setting
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mediaQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }
    
    // Listen for changes
    const handleChange = () => {
      setSettings(prev => ({ ...prev, reducedMotion: mediaQuery.matches }))
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Handle speech queue processing
  useEffect(() => {
    if (!speechSynthesis || !settings.textToSpeech || isSpeaking || speechQueue.length === 0) {
      return
    }

    const processNextInQueue = () => {
      const nextItem = speechQueue[0]
      if (!nextItem) return
      
      const utterance = new SpeechSynthesisUtterance(nextItem.text)
      
      // Apply volume settings
      if (settings.audioVolume === "loud") utterance.volume = 0.8
      if (settings.audioVolume === "louder") utterance.volume = 1.0
      
      // Apply speed settings
      if (settings.audioPlaybackSpeed === "slow") utterance.rate = 0.8
      if (settings.audioPlaybackSpeed === "slower") utterance.rate = 0.6
      
      utterance.onend = () => {
        setSpeechQueue(prev => prev.slice(1))
        setIsSpeaking(false)
      }
      
      utterance.onerror = () => {
        setSpeechQueue(prev => prev.slice(1))
        setIsSpeaking(false)
      }
      
      setIsSpeaking(true)
      speechSynthesis.speak(utterance)
    }
    
    processNextInQueue()
  }, [speechSynthesis, settings.textToSpeech, settings.audioVolume, settings.audioPlaybackSpeed, isSpeaking, speechQueue])

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem("dermascan-a11y-settings")
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      } catch (error) {
        console.error("Failed to parse saved accessibility settings:", error)
        localStorage.removeItem("dermascan-a11y-settings")
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dermascan-a11y-settings", JSON.stringify(settings))
    
    // Apply settings to document
    document.documentElement.classList.toggle("a11y-high-contrast", settings.highContrast)
    document.documentElement.classList.toggle("a11y-large-text", settings.largeText)
    document.documentElement.classList.toggle("a11y-reduced-motion", settings.reducedMotion)
    document.documentElement.classList.toggle("a11y-screen-reader", settings.screenReaderOptimized)
    document.documentElement.setAttribute("data-line-spacing", settings.lineSpacing)
    document.documentElement.setAttribute("data-letter-spacing", settings.letterSpacing)
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }
  
  const speakText = (text: string, priority = false) => {
    if (!settings.textToSpeech || !text) return
    
    // Add to speech queue based on priority
    if (priority) {
      if (isSpeaking && speechSynthesis) {
        speechSynthesis.cancel() // Cancel current speech
        setIsSpeaking(false)
      }
      setSpeechQueue(prev => [{ text, priority }, ...prev])
    } else {
      setSpeechQueue(prev => [...prev, { text, priority }])
    }
  }
  
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeechQueue([])
    }
  }

  return (
    <AccessibilityContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        resetSettings,
        speakText,
        stopSpeaking
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
} 