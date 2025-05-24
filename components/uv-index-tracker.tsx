"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Sun, AlertTriangle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface UVData {
  index: number
  risk: "low" | "moderate" | "high" | "very-high" | "extreme"
  protection: string[]
  location: string
  lastUpdated: string
}

const uvRiskLevels = {
  low: { color: "bg-green-500", text: "Low", max: 2 },
  moderate: { color: "bg-yellow-500", text: "Moderate", max: 5 },
  high: { color: "bg-orange-500", text: "High", max: 7 },
  "very-high": { color: "bg-red-500", text: "Very High", max: 10 },
  extreme: { color: "bg-purple-500", text: "Extreme", max: 11 },
}

export function UVIndexTracker() {
  const [uvData, setUVData] = React.useState<UVData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)

  const getUVData = async () => {
    setIsLoading(true)
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      // In a real app, this would be an API call to a weather service
      // For now, we'll simulate the response
      const mockUVData: UVData = {
        index: Math.floor(Math.random() * 11) + 1,
        risk: "moderate",
        protection: [
          "Wear sunscreen with SPF 30+",
          "Seek shade during midday hours",
          "Wear protective clothing",
        ],
        location: "Your Location",
        lastUpdated: new Date().toLocaleTimeString(),
      }

      setUVData(mockUVData)
    } catch (error) {
      console.error("Error getting UV data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      // Request notification permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsEnabled(true)
          // Set up notification for high UV index
          if (uvData && uvData.index > 7) {
            new Notification("High UV Index Alert", {
              body: `Current UV index is ${uvData.index}. Take necessary precautions!`,
              icon: "/icons/uv-alert.png",
            })
          }
        }
      })
    } else {
      setNotificationsEnabled(false)
    }
  }

  React.useEffect(() => {
    getUVData()
    // Refresh UV data every hour
    const interval = setInterval(getUVData, 3600000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border border-[color:hsl(var(--border))] bg-white dark:bg-slate-900 rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            UV Index Tracker
          </CardTitle>
          <CardDescription>
            Monitor UV levels and get protection recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uvData ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">{uvData.location}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleNotifications}
                  className={cn(
                    "gap-2",
                    notificationsEnabled && "bg-primary/10 text-primary"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  {notificationsEnabled ? "Notifications On" : "Enable Alerts"}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">UV Index {uvData.index}</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-sm font-medium",
                      uvRiskLevels[uvData.risk].color,
                      "text-white"
                    )}
                  >
                    {uvRiskLevels[uvData.risk].text} Risk
                  </span>
                </div>
                <Progress
                  value={(uvData.index / 11) * 100}
                  className="h-2 bg-slate-800 dark:bg-slate-700"
                  indicatorClassName="!bg-[#14B8A6]"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Protection Recommendations</h3>
                <ul className="space-y-2">
                  {uvData.protection.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-slate-500 text-right">
                Last updated: {uvData.lastUpdated}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Button
                onClick={getUVData}
                disabled={isLoading}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                {isLoading ? "Loading..." : "Get UV Index"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 