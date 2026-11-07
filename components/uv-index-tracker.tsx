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
import { toast } from "@/components/ui/use-toast"

interface UVData {
  index: number
  risk: "low" | "moderate" | "high" | "very-high" | "extreme"
  protection: string[]
  location: string
  lastUpdated: string
  source: string
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
  moderate: { color: "bg-yellow-400", text: "Moderate", max: 5 },
  high: { color: "bg-orange-400", text: "High", max: 7 },
  "very-high": { color: "bg-red-500", text: "Very High", max: 10 },
  extreme: { color: "bg-red-600", text: "Extreme", max: 11 },
}

const pollutionLevels = {
  "good": { color: "bg-green-500", text: "Good", max: 50 },
  "moderate": { color: "bg-yellow-400", text: "Moderate", max: 100 },
  "unhealthy-sensitive": { color: "bg-orange-400", text: "Unhealthy for Sensitive Groups", max: 150 },
  "unhealthy": { color: "bg-red-400", text: "Unhealthy", max: 200 },
  "very-unhealthy": { color: "bg-red-500", text: "Very Unhealthy", max: 300 },
  "hazardous": { color: "bg-red-600", text: "Hazardous", max: 500 },
}

// Cache duration for environmental data
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export function UVIndexTracker() {
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

  const fetchEnvironmentalData = async () => {
    setIsLoading(true);
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        });
      });
      
      const { latitude, longitude } = position.coords;
      const uvCacheKey = `uv_data_${latitude}_${longitude}`;
      const polCacheKey = `pollution_data_${latitude}_${longitude}`;
      
      // Check cache first
      const cachedUV = getCachedData(uvCacheKey);
      const cachedPollution = getCachedData(polCacheKey);
      if (cachedUV && cachedPollution) {
        console.log('Using cached environmental data');
        setUVData(cachedUV);
        setPollutionData(cachedPollution);
        setIsLoading(false);
        return;
      }
      
      // Fetch both UV and air quality from our secure backend proxy route
      const response = await fetch(`/api/uv?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) {
        throw new Error(`Server proxy error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch environmental data');
      }

      // Process UV Data
      const uvIndex = typeof data.uv?.index === 'number' ? data.uv.index : 5;
      const uvRisk = determineUVRisk(uvIndex);
      const uvSource = data.uv?.source || 'Estimated';
      const locationName = data.uv?.location || 'Your Location';

      const newUVData: UVData = {
        index: uvIndex,
        risk: uvRisk,
        protection: getProtectionRecommendations(uvRisk),
        location: locationName,
        lastUpdated: new Date().toLocaleString(),
        source: uvSource
      };

      setCachedData(uvCacheKey, newUVData);
      setUVData(newUVData);

      // Process Pollution Data
      const aqi = typeof data.pollution?.aqi === 'number' ? data.pollution.aqi : 45;
      const polLevel = determinePollutionLevel(aqi);
      const newPollutionData: PollutionData = {
        aqi,
        level: polLevel,
        pollutants: data.pollution?.pollutants || { pm25: 12, pm10: 25, o3: 20, no2: 15 },
        healthEffects: getHealthEffects(polLevel),
        location: data.pollution?.location || locationName,
        lastUpdated: new Date().toLocaleString(),
      };

      setCachedData(polCacheKey, newPollutionData);
      setPollutionData(newPollutionData);

      toast({
        title: "Environmental Data Updated",
        description: `UV: ${uvIndex} (${uvSource}), Air Quality: ${aqi}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error getting environmental data:", error);
      // Fallback to estimated data if offline or unavailable
      const mockUVData: UVData = {
        index: 5,
        risk: "moderate",
        protection: getProtectionRecommendations("moderate"),
        location: "Your Location",
        lastUpdated: new Date().toLocaleString() + " (Estimated)",
        source: "Estimated"
      };
      setUVData(mockUVData);

      const mockPollutionData: PollutionData = {
        aqi: 75,
        level: "moderate",
        pollutants: { pm25: 15, pm10: 45, o3: 60, no2: 25 },
        healthEffects: getHealthEffects("moderate"),
        location: "Estimated Location",
        lastUpdated: new Date().toLocaleString(),
      };
      setPollutionData(mockPollutionData);

      toast({
        title: "Using Estimated Environmental Data",
        description: "Could not retrieve live data. Showing estimates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUVData = fetchEnvironmentalData;
  const getPollutionData = fetchEnvironmentalData;

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
      <Card className="border border-[color:hsl(var(--border))] bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl backdrop-blur-md">
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
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={cn(
                            "px-2 py-1 rounded-full text-white font-semibold shadow-md ring-2 ring-white/40 animate-pulse-glow",
                            uvRiskLevels[uvData.risk].color,
                            "text-white"
                          )}
                          style={{
                            boxShadow: `0 0 16px 4px ${uvRiskLevels[uvData.risk].color.includes('green') ? '#14B8A6' : uvRiskLevels[uvData.risk].color.includes('yellow') ? '#FACC15' : uvRiskLevels[uvData.risk].color.includes('orange') ? '#FB923C' : uvRiskLevels[uvData.risk].color.includes('red') ? '#EF4444' : '#A21CAF'}40` // 40 = 25% opacity
                          }}
                        >
                          {uvRiskLevels[uvData.risk].text} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={(uvData.index / 11) * 100}
                        className="h-3 rounded-full bg-gradient-to-r from-green-200 via-yellow-200 via-50% via-orange-200 to-red-300 dark:from-green-900 dark:via-yellow-900 dark:to-red-900 shadow-md"
                        indicatorClassName={cn("transition-all rounded-full shadow-lg", uvRiskLevels[uvData.risk].color)}
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>High</span>
                        <span>Extreme</span>
                      </div>
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
                          pollutionLevels[pollutionData.level].color,
                          "text-white"
                        )}
                      >
                        {pollutionLevels[pollutionData.level].text}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={(pollutionData.aqi / 500) * 100}
                        className="h-3 rounded-full bg-gradient-to-r from-green-200 via-yellow-200 via-50% via-orange-200 to-red-300 dark:from-green-900 dark:via-yellow-900 dark:to-red-900 shadow-md"
                        indicatorClassName={cn("transition-all rounded-full shadow-lg", pollutionLevels[pollutionData.level].color)}
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Good</span>
                        <span>Moderate</span>
                        <span>Unhealthy</span>
                        <span>Hazardous</span>
                      </div>
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
