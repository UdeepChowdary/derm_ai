"use client"

import { useState, useEffect } from "react"
import { useAccessibility } from "./accessibility-provider"
import { Mic, Volume2, VolumeX, Play, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

// Add type declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      }
    };
    length: number;
  };
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface AudioAccessibilityProps {
  pageContent?: string
  audioDescription?: string
}

export function AudioAccessibility({ pageContent, audioDescription }: AudioAccessibilityProps) {
  const { settings, speakText, stopSpeaking } = useAccessibility()
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  
  // Initialize speech recognition when available
  useEffect(() => {
    if (typeof window !== 'undefined' && settings.voiceCommands) {
      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        try {
          const recognitionInstance = new SpeechRecognition()
          recognitionInstance.continuous = false
          recognitionInstance.interimResults = false
          recognitionInstance.lang = 'en-US'
          
          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase()
            processVoiceCommand(transcript)
          }
          
          recognitionInstance.onerror = () => {
            setIsListening(false)
          }
          
          recognitionInstance.onend = () => {
            setIsListening(false)
          }
          
          setRecognition(recognitionInstance)
        } catch (error) {
          console.error("Error initializing speech recognition:", error)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.voiceCommands])
  
  // Automatically speak page description when available
  useEffect(() => {
    if (settings.textToSpeech && audioDescription) {
      speakText(audioDescription, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioDescription, settings.textToSpeech])
  
  // Provide audio feedback for important page changes or events
  useEffect(() => {
    // Listen for form submission events
    const handleFormSubmit = () => {
      if (settings.audioFeedback) {
        speakText("Form submitted. Processing your request.", true)
      }
    }
    
    // Listen for error events
    const handleError = (event: ErrorEvent) => {
      if (settings.audioFeedback) {
        speakText("An error occurred. Please try again.", true)
      }
    }
    
    if (settings.audioFeedback) {
      document.addEventListener('submit', handleFormSubmit)
      window.addEventListener('error', handleError)
    }
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit)
      window.removeEventListener('error', handleError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.audioFeedback])
  
  // Process voice commands
  const processVoiceCommand = (transcript: string) => {
    // Navigation commands
    if (transcript.includes("go home") || transcript.includes("go to home")) {
      window.location.href = "/home"
    } else if (transcript.includes("go to history") || transcript.includes("show history")) {
      window.location.href = "/history"
    } else if (transcript.includes("go to settings") || transcript.includes("open settings")) {
      window.location.href = "/settings"
    } else if (transcript.includes("go back")) {
      window.history.back()
    }
    
    // Reading commands
    else if (transcript.includes("read page") || transcript.includes("read aloud")) {
      if (pageContent) speakText(pageContent)
    } else if (transcript.includes("stop reading") || transcript.includes("stop speaking")) {
      stopSpeaking()
    }
    
    // Accessibility commands
    else if (transcript.includes("high contrast") || transcript.includes("increase contrast")) {
      const settingsButton = document.querySelector("[aria-label='Accessibility Settings']") as HTMLButtonElement
      if (settingsButton) settingsButton.click()
    } else {
      // Command not recognized
      console.log(`Command not recognized: "${transcript}"`)
    }
  }
  
  // Toggle listening for voice commands
  const toggleListening = () => {
    if (!recognition) return
    
    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
        setIsListening(true)
        
        if (settings.audioFeedback) {
          speakText("Listening for commands", true)
        }
      } catch (error: unknown) {
        console.error("Error starting speech recognition:", error)
        if (error instanceof Error) {
          console.error("Voice Command Error:", error.message)
        }
        setIsListening(false)
      }
    }
  }
  
  const readPageContent = () => {
    if (pageContent) {
      speakText(pageContent)
    } else {
      // If no specific content provided, try to read main content
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        speakText(mainContent.innerText)
      }
    }
  }
  
  if (!settings.textToSpeech && !settings.audioFeedback && !settings.voiceCommands) {
    return null // Don't render if audio features are disabled
  }
  
  return (
    <div className="fixed bottom-28 right-4 flex flex-col gap-2 z-50">
      {settings.textToSpeech && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-primary bg-background"
          onClick={readPageContent}
          aria-label="Read page content aloud"
          title="Read page content aloud"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      
      {settings.textToSpeech && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-primary bg-background"
          onClick={stopSpeaking}
          aria-label="Stop speaking"
          title="Stop speaking"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
      
      {settings.voiceCommands && recognition && (
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          className={`rounded-full border-2 ${isListening ? 'border-red-500 bg-red-100 dark:bg-red-900/20' : 'border-primary bg-background'}`}
          onClick={toggleListening}
          aria-label={isListening ? "Listening for voice commands" : "Activate voice commands"}
          title={isListening ? "Listening for voice commands" : "Activate voice commands"}
        >
          <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
        </Button>
      )}
      
      {settings.voiceCommands && !recognition && (
        <Button
          variant="outline"
          size="icon"
          disabled
          className="rounded-full border-2 border-amber-500 bg-background"
          aria-label="Voice commands not supported"
          title="Voice commands not supported in your browser"
        >
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </Button>
      )}
    </div>
  )
} 