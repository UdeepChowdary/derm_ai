"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppIconGenerator } from "@/components/app-icons/app-icon-generator"
import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppIconPreviewPage() {
  const router = useRouter()
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({})

  const handleGenerateIcon = (size: string, dataUrl: string) => {
    setDownloadUrls((prev) => ({ ...prev, [size]: dataUrl }))
  }

  const downloadIcon = (size: string) => {
    const url = downloadUrls[size]
    if (!url) return

    const link = document.createElement("a")
    link.href = url
    link.download = `derm-ai-icon-${size}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">App Icon Preview</h1>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 pb-20">
        <Tabs defaultValue="animated">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="animated">Animated Icons</TabsTrigger>
            <TabsTrigger value="static">Static Icons</TabsTrigger>
          </TabsList>

          <TabsContent value="animated" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Animated Web Favicon</CardTitle>
                  <CardDescription>For browser tabs and bookmarks</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 bg-white rounded-lg p-2 flex items-center justify-center">
                    <AppIconGenerator size={64} animated={true} frameRate={15} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                    The favicon animates in real-time in the browser tab
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>iOS Live Activity Icon</CardTitle>
                  <CardDescription>For Dynamic Island and Lock Screen</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 bg-black rounded-2xl p-2 flex items-center justify-center">
                    <AppIconGenerator size={64} animated={true} frameRate={10} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                    Subtle animation for iOS Live Activities
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Android Adaptive Icon Animation</CardTitle>
                <CardDescription>Foreground layer animation for Android</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-64 h-64 mb-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 rounded-full p-4 flex items-center justify-center">
                  <AppIconGenerator size={200} animated={true} frameRate={30} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center max-w-md">
                  Android Adaptive Icons separate foreground and background layers. The magnifying glass animation is
                  applied to the foreground layer.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="static" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>iOS App Icon</CardTitle>
                  <CardDescription>1024×1024 pixels</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 bg-white rounded-3xl overflow-hidden">
                    <AppIconGenerator
                      size={128}
                      animated={false}
                      onGenerate={(url) => handleGenerateIcon("1024", url)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadIcon("1024")}
                    disabled={!downloadUrls["1024"]}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Android Icon</CardTitle>
                  <CardDescription>512×512 pixels</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 bg-white rounded-full overflow-hidden">
                    <AppIconGenerator
                      size={128}
                      animated={false}
                      onGenerate={(url) => handleGenerateIcon("512", url)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadIcon("512")}
                    disabled={!downloadUrls["512"]}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Favicon</CardTitle>
                  <CardDescription>32×32 pixels</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 bg-white rounded-lg p-2 flex items-center justify-center">
                    <div className="w-16 h-16">
                      <AppIconGenerator
                        size={32}
                        animated={false}
                        onGenerate={(url) => handleGenerateIcon("32", url)}
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadIcon("32")} disabled={!downloadUrls["32"]}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Implementation Notes</h2>

          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              <strong>Web:</strong> The animated favicon is implemented using Canvas API and updates in real-time. It's
              already active in your browser tab.
            </p>

            <p>
              <strong>iOS:</strong> For Live Activities, export a sequence of PNG frames and implement using the
              ActivityKit framework. For the app icon, use the static version.
            </p>

            <p>
              <strong>Android:</strong> For Adaptive Icons, separate the foreground (magnifying glass) and background
              (skin circle) layers. Use AnimatedVectorDrawable for the animation.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Note: Platform support for animated app icons varies. iOS doesn't support animated home screen icons
              natively, but does support Live Activity animations. Android supports limited animations through Adaptive
              Icons.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
