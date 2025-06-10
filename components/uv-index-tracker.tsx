"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Sun, AlertTriangle, Bell, Wind, Droplets, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { API_KEYS } from "@/config/api-keys"

interface UVData {
  index: number
  risk: "low" | "moderate" | "high" | "very-high" | "extreme"
  protection: string[]
  location: string
  lastUpdated: string
}

interface PollutionData {
  aqi: number // Air Quality Index
  level: "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous"
  pollutants: {
    pm25: number // PM2.5
    pm10: number // PM10
    o3: number // Ozone
    no2: number // Nitrogen Dioxide
  }
  healthEffects: string[]
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

const pollutionLevels = {
  "good": { color: "bg-green-500", text: "Good", max: 50 },
  "moderate": { color: "bg-yellow-500", text: "Moderate", max: 100 },
  "unhealthy-sensitive": { color: "bg-orange-500", text: "Unhealthy for Sensitive Groups", max: 150 },
  "unhealthy": { color: "bg-red-500", text: "Unhealthy", max: 200 },
  "very-unhealthy": { color: "bg-purple-500", text: "Very Unhealthy", max: 300 },
  "hazardous": { color: "bg-slate-800", text: "Hazardous", max: 500 },
}

export function UVIndexTracker() {
  // Debug log to check if API key is loaded
  React.useEffect(() => {
    console.log('OpenWeatherMap API Key:', API_KEYS.OPENWEATHER_API_KEY);
    console.log('Environment Variables:', {
      NEXT_PUBLIC_OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
      NODE_ENV: process.env.NODE_ENV
    });
  }, []);

  const [uvData, setUVData] = React.useState<UVData | null>(null)
  const [pollutionData, setPollutionData] = React.useState<PollutionData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"uv" | "pollution">("uv")
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)

  // Helper function to determine UV risk level
  const determineUVRisk = (index: number): UVData['risk'] => {
    if (index <= 2) return "low"
    if (index <= 5) return "moderate"
    if (index <= 7) return "high"
    if (index <= 10) return "very-high"
    return "extreme"
  }
  
  // Helper function to determine pollution level
  const determinePollutionLevel = (aqi: number): PollutionData['level'] => {
    if (aqi <= 50) return "good"
    if (aqi <= 100) return "moderate"
    if (aqi <= 150) return "unhealthy-sensitive"
    if (aqi <= 200) return "unhealthy"
    if (aqi <= 300) return "very-unhealthy"
    return "hazardous"
  }
  
  // Helper function to get protection recommendations based on UV risk level
  const getProtectionRecommendations = (risk: UVData['risk']): string[] => {
    const baseRecommendations = [
      "Wear sunscreen with SPF 30+",
      "Reapply sunscreen every 2 hours"
    ]
    
    if (risk === "low") {
      return [...baseRecommendations]
    } else if (risk === "moderate") {
      return [
        ...baseRecommendations,
        "Seek shade during midday hours",
        "Wear protective clothing"
      ]
    } else if (risk === "high") {
      return [
        ...baseRecommendations,
        "Seek shade during midday hours",
        "Wear protective clothing",
        "Use UV-blocking sunglasses"
      ]
    } else {
      return [
        ...baseRecommendations,
        "Avoid sun exposure between 10am-4pm",
        "Wear protective clothing, including hat",
        "Use UV-blocking sunglasses",
        "Check UV forecast regularly"
      ]
    }
  }
  
  // Helper function to get health effects based on pollution level
  const getHealthEffects = (level: PollutionData['level']): string[] => {
    switch(level) {
      case "good":
        return [
          "Air quality is considered satisfactory",
          "Air pollution poses little or no risk",
          "Ideal for outdoor activities"
        ]
      case "moderate":
        return [
          "Air quality is acceptable",
          "May cause mild irritation for sensitive individuals",
          "Consider reducing prolonged outdoor exertion if you experience symptoms"
        ]
      case "unhealthy-sensitive":
        return [
          "Members of sensitive groups may experience health effects",
          "General public is less likely to be affected",
          "People with respiratory or heart conditions should limit outdoor exposure",
          "Consider wearing a mask outdoors if sensitive"
        ]
      case "unhealthy":
        return [
          "Everyone may begin to experience health effects",
          "Members of sensitive groups may experience more serious effects",
          "Limit outdoor activities and use air purifiers indoors",
          "Wear masks when outdoors"
        ]
      case "very-unhealthy":
      case "hazardous":
        return [
          "Health warnings of emergency conditions",
          "Entire population is more likely to be affected",
          "Avoid all outdoor physical activities",
          "Keep windows and doors closed",
          "Use air purifiers indoors",
          "Wear N95 masks if you must go outside"
        ]
      default:
        return [
          "Consider limiting outdoor activities",
          "Keep windows closed if pollution is high",
          "Use air purifiers indoors if available"
        ]
    }
  }

  const getUVData = async () => {
    setIsLoading(true)
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      
      const { latitude, longitude } = position.coords
      
      // Fetch location name using reverse geocoding
      const geocodingResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEYS.OPENWEATHER_API_KEY}`
      )
      const geocodingData = await geocodingResponse.json()
      const locationName = geocodingData[0]?.name || 'Your Location'
      
      // Fetch actual UV index from OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alerts&appid=${API_KEYS.OPENWEATHER_API_KEY}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch UV data')
      }
      
      const data = await response.json()
      const uvIndex = Math.round(data.current.uvi) // Current UV index
      const risk = determineUVRisk(uvIndex)
      
      // Get protection recommendations based on UV level
      const protectionRecs = getProtectionRecommendations(risk)
      
      const newUVData: UVData = {
        index: uvIndex,
        risk: risk,
        protection: protectionRecs,
        location: locationName,
        lastUpdated: new Date(data.current.dt * 1000).toLocaleString(),
      }

      setUVData(newUVData)
    } catch (error) {
      console.error("Error getting UV data:", error)
      // Fallback to mock data if API fails
      const mockUVData: UVData = {
        index: 5,
        risk: "moderate",
        protection: [
          "Wear sunscreen with SPF 30+",
          "Seek shade during midday hours",
          "Wear protective clothing",
          "Use UV-blocking sunglasses"
        ],
        location: "Your Location",
        lastUpdated: new Date().toLocaleString() + " (Estimated)",
      }
      setUVData(mockUVData)
    } finally {
      setIsLoading(false)
    }
  }
  
  const getPollutionData = async () => {
    setIsLoading(true)
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      
      const { latitude, longitude } = position.coords
      
      // Fetch location name if not already done in getUVData
      let locationName = "Your Location"
      if (uvData?.location) {
        locationName = uvData.location
      } else {
        try {
          const geocodingResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEYS.OPENWEATHER_API_KEY}`
          )
          const geocodingData = await geocodingResponse.json()
          locationName = geocodingData[0]?.name || 'Your Location'
        } catch (error) {
          console.error("Error fetching location name:", error)
        }
      }
      
      // Fetch air pollution data from OpenWeatherMap API
      const pollutionResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEYS.OPENWEATHER_API_KEY}`
      )
      
      if (!pollutionResponse.ok) {
        throw new Error('Failed to fetch air pollution data')
      }
      
      const pollutionData = await pollutionResponse.json()
      const currentPollution = pollutionData.list[0] // Current pollution data
      
      // Convert OpenWeatherMap AQI (1-5 scale) to standard AQI (0-500 scale)
      const apiAqi = currentPollution.main.aqi
      let standardAqi: number
      
      switch(apiAqi) {
        case 1: standardAqi = 25; break // mid-value of 0-50 range
        case 2: standardAqi = 75; break // mid-value of 51-100 range
        case 3: standardAqi = 125; break // mid-value of 101-150 range
        case 4: standardAqi = 175; break // mid-value of 151-200 range
        case 5: standardAqi = 300; break // higher value in very unhealthy range
        default: standardAqi = 50 // fallback
      }
      
      const pollutionLevel = determinePollutionLevel(standardAqi)
      
      // Extract pollutant values
      const { pm2_5, pm10, o3, no2 } = currentPollution.components
      
      const newPollutionData: PollutionData = {
        aqi: standardAqi,
        level: pollutionLevel,
        pollutants: {
          pm25: pm2_5,
          pm10: pm10,
          o3: o3,
          no2: no2,
        },
        healthEffects: getHealthEffects(pollutionLevel),
        location: locationName,
        lastUpdated: new Date(currentPollution.dt * 1000).toLocaleString(),
      }

      setPollutionData(newPollutionData)
    } catch (error) {
      console.error("Error getting pollution data:", error)
      // Fallback to mock data if API fails
      const mockPollutionData: PollutionData = {
        aqi: 75,
        level: "moderate",
        pollutants: {
          pm25: 15,
          pm10: 45,
          o3: 60,
          no2: 25,
        },
        healthEffects: [
          "May cause respiratory irritation for sensitive groups",
          "Consider limiting prolonged outdoor activities if sensitive",
          "Keep windows closed if pollution is high",
          "Use air purifiers indoors if available",
        ],
        location: "Your Location",
        lastUpdated: new Date().toLocaleString() + " (Estimated)",
      }
      setPollutionData(mockPollutionData)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      // Request notification permission
      if (typeof Notification !== 'undefined') {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setNotificationsEnabled(true)
            // Set up notification for high environmental health risks
            if (uvData && uvData.index > 7) {
              new Notification("High UV Index Alert", {
                body: `Current UV index is ${uvData.index}. Take necessary precautions!`,
                icon: "/icons/favicon-32x32.png",
              })
            }
            if (pollutionData && pollutionData.aqi > 150) {
              new Notification("Poor Air Quality Alert", {
                body: `Current Air Quality Index is ${pollutionData.aqi}. Consider limiting outdoor exposure.`,
                icon: "/icons/favicon-32x32.png",
              })
            }
          }
        })
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  React.useEffect(() => {
    getUVData()
    getPollutionData()
    // Refresh data every hour
    const interval = setInterval(() => {
      getUVData()
      getPollutionData()
    }, 3600000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border border-[color:hsl(var(--border))] bg-white dark:bg-slate-900 rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Environmental Health Monitor
          </CardTitle>
          <CardDescription>
            Track UV index and air quality to protect your skin and health
          </CardDescription>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500">
                {(uvData || pollutionData)?.location || "Your Location"}
              </span>
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
              {notificationsEnabled ? "Alerts On" : "Enable Alerts"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <Tabs 
            defaultValue="uv" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "uv" | "pollution")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="uv" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                UV Index
              </TabsTrigger>
              <TabsTrigger value="pollution" className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Air Quality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uv" className="space-y-4 mt-4">
              {uvData ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">UV Index {uvData.index}</span>
                      <Badge
                        className={cn(
                          "px-2 py-1 rounded-full",
                          uvRiskLevels[uvData.risk].color
                        )}
                      >
                        {uvRiskLevels[uvData.risk].text} Risk
                      </Badge>
                    </div>
                    <Progress
                      value={(uvData.index / 11) * 100}
                      className="h-2 bg-slate-200 dark:bg-slate-700"
                      indicatorClassName={cn("transition-all", uvRiskLevels[uvData.risk].color)}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                      <span>Extreme</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Skin Protection Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {uvData.protection.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
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
            </TabsContent>

            <TabsContent value="pollution" className="space-y-4 mt-4">
              {pollutionData ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">AQI {pollutionData.aqi}</span>
                      <Badge
                        className={cn(
                          "px-2 py-1",
                          pollutionLevels[pollutionData.level].color
                        )}
                      >
                        {pollutionLevels[pollutionData.level].text}
                      </Badge>
                    </div>
                    <Progress
                      value={(pollutionData.aqi / 300) * 100}
                      className="h-2 bg-slate-200 dark:bg-slate-700"
                      indicatorClassName={cn("transition-all", pollutionLevels[pollutionData.level].color)}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Good</span>
                      <span>Moderate</span>
                      <span>Unhealthy</span>
                      <span>Hazardous</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-xs text-slate-500">PM2.5</div>
                      <div className="font-semibold">{pollutionData.pollutants.pm25}</div>
                    </div>
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-xs text-slate-500">PM10</div>
                      <div className="font-semibold">{pollutionData.pollutants.pm10}</div>
                    </div>
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-xs text-slate-500">Ozone</div>
                      <div className="font-semibold">{pollutionData.pollutants.o3}</div>
                    </div>
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-xs text-slate-500">NO₂</div>
                      <div className="font-semibold">{pollutionData.pollutants.no2}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Health Impact & Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {pollutionData.healthEffects.map((effect, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-slate-500 text-right">
                    Last updated: {pollutionData.lastUpdated}
                  </p>
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
