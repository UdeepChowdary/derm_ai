"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { API_KEYS } from "@/config/api-keys"

interface UVData {
  index: number
  risk: "low" | "moderate" | "high" | "very-high" | "extreme"
  protection: string[]
  location: string
  lastUpdated: string
  isMock?: boolean
}

const uvRiskLevels = {
  low: { color: "bg-green-500", text: "Low" },
  moderate: { color: "bg-yellow-500", text: "Moderate" },
  high: { color: "bg-orange-500", text: "High" },
  "very-high": { color: "bg-red-500", text: "Very High" },
  extreme: { color: "bg-purple-500", text: "Extreme" },
}

export function UVIndexTracker() {
  const [uvData, setUVData] = React.useState<UVData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Helper to determine UV risk level from the index
  const determineUVRisk = (index: number): UVData['risk'] => {
    if (index <= 2) return "low"
    if (index <= 5) return "moderate"
    if (index <= 7) return "high"
    if (index <= 10) return "very-high"
    return "extreme"
  }
  
  // Helper to get protection recommendations based on risk
  const getProtectionRecommendations = (risk: UVData['risk']): string[] => {
    const base = ["Wear sunscreen with SPF 30+", "Reapply sunscreen every 2 hours"]
    if (risk === "low") return base
    if (risk === "moderate") return [...base, "Seek shade during midday hours", "Wear protective clothing"]
    if (risk === "high") return [...base, "Seek shade", "Wear protective clothing", "Use UV-blocking sunglasses"]
    return [...base, "Avoid sun exposure between 10am-4pm", "Wear protective clothing, including a hat", "Use UV-blocking sunglasses"]
  }

  React.useEffect(() => {
    const getUVData = async () => {
      setIsLoading(true)
      setError(null)

      // --- Mock Data Fallback ---
      const getMockUVData = (message: string): UVData => {
        console.warn(message)
        const mockUVIndex = Math.floor(Math.random() * 11)
        const risk = determineUVRisk(mockUVIndex)
        return {
          index: mockUVIndex,
          risk,
          protection: getProtectionRecommendations(risk),
          location: 'Mock Location',
          lastUpdated: new Date().toLocaleString(),
          isMock: true
        }
      }

      // --- 1. Check for API Key ---
      if (!API_KEYS?.OPENWEATHER_API_KEY) {
        setUVData(getMockUVData('OpenWeatherMap API key not found. Using mock data.'))
        setIsLoading(false)
        return
      }

      // --- 2. Get Geolocation ---
      let position: GeolocationPosition
      try {
        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
      } catch (geoError) {
        setUVData(getMockUVData(`Geolocation failed: ${(geoError as Error).message}. Using mock data.`))
        setIsLoading(false)
        return
      }
      
      const { latitude, longitude } = position.coords
      
      // --- 3. Fetch Weather Data ---
      try {
        // Fetch location name
        const geocodingResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEYS.OPENWEATHER_API_KEY}`
        )
        if (!geocodingResponse.ok) throw new Error('Failed to fetch location name.')
        const geocodingData = await geocodingResponse.json()
        const locationName = geocodingData[0]?.name || 'Your Location'
        
        // Fetch UV index
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alerts&appid=${API_KEYS.OPENWEATHER_API_KEY}&units=metric`
        )
        if (!weatherResponse.ok) throw new Error('Failed to fetch UV data.')
        
        const data = await weatherResponse.json()
        const uvIndex = Math.round(data.current?.uvi ?? 0)
        const risk = determineUVRisk(uvIndex)
        
        setUVData({
          index: uvIndex,
          risk,
          protection: getProtectionRecommendations(risk),
          location: locationName,
          lastUpdated: new Date(data.current.dt * 1000).toLocaleString(),
        })
      } catch (apiError) {
        setUVData(getMockUVData(`API call failed: ${(apiError as Error).message}. Using mock data.`))
      } finally {
        setIsLoading(false)
      }
    }

    getUVData()
  }, [])

  // --- Render Logic ---
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">Loading UV data...</CardContent>
      </Card>
    )
  }

  if (error || !uvData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UV Index Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-red-500">
          {error || "Failed to load UV data. Please try again later."}
        </CardContent>
      </Card>
    )
  }

  const riskInfo = uvRiskLevels[uvData.risk]
  const progress = (uvData.index / 11) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          UV Index Tracker
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
          <MapPin className="h-4 w-4" /> 
          {uvData.location}
          {uvData.isMock && <Badge variant="outline">Mock Data</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">{uvData.index}</div>
          <Badge className={cn("text-white", riskInfo.color)}>{riskInfo.text}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div>
          <h3 className="font-semibold">Protection Tips</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            {uvData.protection.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {uvData.lastUpdated}
        </div>
      </CardContent>
    </Card>
  )
}
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Button
                    onClick={getPollutionData}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Wind className="h-4 w-4" />
                    {isLoading ? "Loading..." : "Get Air Quality Data"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
