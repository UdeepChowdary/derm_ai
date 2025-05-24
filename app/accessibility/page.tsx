"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { AccessibilitySettings } from "@/components/accessibility-settings"

export default function AccessibilityPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-transparent">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back to previous page">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Accessibility</h1>
      </header>

      <main id="main-content" className="flex-1 container max-w-2xl mx-auto p-4 pb-24">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Our Commitment to Accessibility</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Derm AI is committed to ensuring our app is accessible to all users, regardless of ability or disability. 
              We strive to meet WCAG 2.1 AA standards and continuously work to improve our accessibility features.
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
              <CardDescription>Tools and settings to customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Visual Accessibility</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>High contrast mode for better visibility</li>
                  <li>Resizable text with larger font options</li>
                  <li>Screen reader compatibility with ARIA labels</li>
                  <li>Dark mode support for reduced eye strain</li>
                  <li>Alt text for all images</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Audio Accessibility</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>Text-to-speech functionality to read content aloud</li>
                  <li>Voice commands for hands-free navigation</li>
                  <li>Audio feedback for important interactions</li>
                  <li>Adjustable speech rate and volume</li>
                  <li>Audio descriptions for images and visual content</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Motor Accessibility</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>Full keyboard navigation support</li>
                  <li>Skip to content links</li>
                  <li>Large touch targets for easier interaction</li>
                  <li>No time-limited elements</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Cognitive Accessibility</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li>Simple, consistent navigation</li>
                  <li>Clear, concise language</li>
                  <li>Option to reduce motion and animations</li>
                  <li>Adjustable text spacing for improved readability</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Access all accessibility options by clicking the accessibility button (floating icon at the bottom right 
                of your screen).
              </p>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Keyboard Shortcuts</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li><strong>Tab</strong>: Navigate between interactive elements</li>
                  <li><strong>Enter/Space</strong>: Activate buttons, links, and controls</li>
                  <li><strong>Esc</strong>: Close dialogs and modals</li>
                  <li><strong>Arrow Keys</strong>: Navigate within components like sliders or dropdown menus</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Voice Commands</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                  Enable voice commands in the accessibility settings. Once enabled, click the microphone icon in the bottom right 
                  corner to start listening for commands.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  <li><strong>Go home / Go to home</strong>: Navigate to the home page</li>
                  <li><strong>Go to history / Show history</strong>: View your scan history</li>
                  <li><strong>Go to settings / Open settings</strong>: Access settings</li>
                  <li><strong>Go back</strong>: Return to the previous page</li>
                  <li><strong>Read page / Read aloud</strong>: Have the page content read aloud</li>
                  <li><strong>Stop reading / Stop speaking</strong>: Stop the text-to-speech</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Screen Readers</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Derm AI is optimized to work with screen readers including VoiceOver, NVDA, JAWS, and TalkBack. 
                  We use semantic HTML and ARIA attributes to ensure all content is properly announced.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Our audio accessibility features provide multiple ways to interact with content:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Text-to-Speech</strong>: Click the play button in the bottom right to have page content read aloud.</li>
                <li><strong>Voice Commands</strong>: Use your voice to navigate and control the application.</li>
                <li><strong>Audio Feedback</strong>: Receive audio notifications for important actions and alerts.</li>
                <li><strong>Customizable Playback</strong>: Adjust speech rate and volume in accessibility settings.</li>
              </ul>
              
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                These audio features work alongside visual elements to create a multi-sensory experience that benefits all users, 
                particularly those with visual impairments or reading difficulties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback and Assistance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We continuously work to improve our accessibility. If you encounter any barriers or have suggestions for improvement, 
                please contact us at:
              </p>
              <p className="font-medium text-teal-600 dark:text-teal-400">accessibility@dermai-example.com</p>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                const settingsButton = document.querySelector("[aria-label='Accessibility Settings']") as HTMLButtonElement
                if (settingsButton) settingsButton.click()
              }}
              className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              Open Accessibility Settings
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation currentPath="/accessibility" />
    </div>
  )
} 