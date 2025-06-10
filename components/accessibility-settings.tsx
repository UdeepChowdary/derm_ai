"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAccessibility } from "./accessibility-provider"
import { AccessibilityIcon, Type, Zap, AlignJustify, Text, Volume2, Mic } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AccessibilitySettings() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings, resetSettings } = useAccessibility()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full fixed bottom-20 right-4 z-50 border-2 !border-[#14B8A6] bg-background"
          aria-label="Accessibility Settings"
        >
          <AccessibilityIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AccessibilityIcon className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience to meet your accessibility needs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          {/* Display Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Display</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <Label htmlFor="high-contrast">High Contrast</Label>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  aria-label="Toggle high contrast mode"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <Label htmlFor="large-text">Larger Text</Label>
                </div>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSettings({ largeText: checked })}
                  aria-label="Toggle larger text"
                />
              </div>
            </CardContent>
          </Card>

          {/* Motion Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Motion & Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduce Motion</Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </CardContent>
          </Card>

          {/* Text Spacing */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Text Spacing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <AlignJustify className="h-4 w-4" />
                  <Label>Line Spacing</Label>
                </div>
                <RadioGroup
                  value={settings.lineSpacing}
                  onValueChange={(value) => updateSettings({ lineSpacing: value as "normal" | "wide" | "wider" })}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="normal" id="line-normal" />
                    <Label htmlFor="line-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="wide" id="line-wide" />
                    <Label htmlFor="line-wide">Wide</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="wider" id="line-wider" />
                    <Label htmlFor="line-wider">Wider</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Text className="h-4 w-4" />
                  <Label>Letter Spacing</Label>
                </div>
                <RadioGroup
                  value={settings.letterSpacing}
                  onValueChange={(value) => updateSettings({ letterSpacing: value as "normal" | "wide" | "wider" })}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="normal" id="letter-normal" />
                    <Label htmlFor="letter-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="wide" id="letter-wide" />
                    <Label htmlFor="letter-wide">Wide</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="wider" id="letter-wider" />
                    <Label htmlFor="letter-wider">Wider</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          {/* Audio Accessibility Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Audio & Voice</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <Label htmlFor="text-to-speech">Text-to-Speech</Label>
                </div>
                <Switch
                  id="text-to-speech"
                  checked={settings.textToSpeech}
                  onCheckedChange={(checked) => updateSettings({ textToSpeech: checked })}
                  aria-label="Toggle text-to-speech"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <Label htmlFor="audio-feedback">Audio Feedback</Label>
                </div>
                <Switch
                  id="audio-feedback"
                  checked={settings.audioFeedback}
                  onCheckedChange={(checked) => updateSettings({ audioFeedback: checked })}
                  aria-label="Toggle audio feedback for interactions"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <Label htmlFor="voice-commands">Voice Commands</Label>
                </div>
                <Switch
                  id="voice-commands"
                  checked={settings.voiceCommands}
                  onCheckedChange={(checked) => updateSettings({ voiceCommands: checked })}
                  aria-label="Toggle voice command support"
                />
              </div>
              
              {(settings.textToSpeech || settings.audioFeedback) && (
                <>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="playback-speed">Playback Speed</Label>
                    <RadioGroup
                      id="playback-speed"
                      value={settings.audioPlaybackSpeed}
                      onValueChange={(value) => updateSettings({ audioPlaybackSpeed: value as "normal" | "slow" | "slower" })}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="normal" id="speed-normal" />
                        <Label htmlFor="speed-normal">Normal</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="slow" id="speed-slow" />
                        <Label htmlFor="speed-slow">Slow</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="slower" id="speed-slower" />
                        <Label htmlFor="speed-slower">Slower</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="volume">Volume</Label>
                    <RadioGroup
                      id="volume"
                      value={settings.audioVolume}
                      onValueChange={(value) => updateSettings({ audioVolume: value as "normal" | "loud" | "louder" })}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="normal" id="volume-normal" />
                        <Label htmlFor="volume-normal">Normal</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="loud" id="volume-loud" />
                        <Label htmlFor="volume-loud">Loud</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="louder" id="volume-louder" />
                        <Label htmlFor="volume-louder">Louder</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
              
              {settings.voiceCommands && (
                <div className="rounded-md bg-muted px-4 py-3 text-sm">
                  <p className="mb-2 font-medium">Available Voice Commands:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Go home / Go to home</li>
                    <li>Go to history / Show history</li>
                    <li>Go to settings / Open settings</li>
                    <li>Go back</li>
                    <li>Read page / Read aloud</li>
                    <li>Stop reading / Stop speaking</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CardFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" className="!border-[#14B8A6] !text-[#14B8A6]" onClick={resetSettings}>
            Reset Default
          </Button>
          <Button className="!bg-[#14B8A6] !text-white" onClick={() => setOpen(false)}>Close</Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  )
} 