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

// Add this function after the interfaces and before the component
const validateApiKey = (key: string): boolean => {
  if (!key || key === 'your_openuv_key_here') {
    console.error('Invalid OpenUV API key');
    return false;
  }
  return true;
};

// Add this function after the interfaces
const getUVFromOpenWeather = async (lat: number, lon: number): Promise<number> => {
  try {
    const response = await fetch(
      `${API_KEYS.ENDPOINTS.OPENWEATHER}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEYS.OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch UV data from OpenWeather');
    }
    
    const data = await response.json();
    return data.value; // OpenWeather returns UV index directly
  } catch (error) {
    console.error('Error fetching UV from OpenWeather:', error);
    throw error;
  }
};

// Add these utility functions at the top of the file, after imports
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
  // Debug log to check if API keys are loaded
  React.useEffect(() => {
    console.log('OpenUV API Key:', API_KEYS.OPENUV_API_KEY);
    console.log('WAQI Token:', API_KEYS.WAQI_API_TOKEN);
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
      const cacheKey = `uv_data_${latitude}_${longitude}`;
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('Using cached UV data');
        setUVData(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Fetch location name using reverse geocoding
      const geocodingResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEYS.OPENWEATHER_API_KEY}`
      );
      const geocodingData = await geocodingResponse.json();
      const locationName = geocodingData[0]?.name || 'Your Location';
      
      let uvIndex: number;
      let source = 'OpenUV';
      
      try {
        // Try OpenUV first
        console.log('Attempting to fetch from OpenUV API...');
        const response = await fetch(
          `${API_KEYS.ENDPOINTS.OPENUV}/uv?lat=${latitude}&lng=${longitude}`,
          {
            headers: {
              'x-access-token': API_KEYS.OPENUV_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('OpenUV API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`OpenUV API failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.result || typeof data.result.uv === 'undefined') {
          throw new Error('Invalid UV data received from OpenUV API');
        }
        
        uvIndex = Math.round(data.result.uv);
        console.log('Successfully fetched UV data from OpenUV:', uvIndex);
      } catch (openUVError) {
        console.log('Falling back to OpenWeather UV data due to:', openUVError);
        source = 'OpenWeather';
        uvIndex = await getUVFromOpenWeather(latitude, longitude);
        console.log('Successfully fetched UV data from OpenWeather:', uvIndex);
      }
      
      const risk = determineUVRisk(uvIndex);
      const protectionRecs = getProtectionRecommendations(risk);
      
      const newUVData: UVData = {
        index: uvIndex,
        risk: risk,
        protection: protectionRecs,
        location: locationName,
        lastUpdated: new Date().toLocaleString(),
        source: source
      };

      // Cache the new data
      setCachedData(cacheKey, newUVData);
      setUVData(newUVData);
      
      toast({
        title: "UV Data Updated",
        description: `Current UV Index: ${uvIndex} (Data from ${source})`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error getting UV data:", error);
      // Fallback to mock data if all APIs fail
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
        source: "Estimated"
      };
      setUVData(mockUVData);
      
      toast({
        title: "UV Data Unavailable",
        description: "Using estimated UV data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPollutionData = async () => {
    setIsLoading(true)
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      
      const { latitude, longitude } = position.coords
      
      // Fetch air quality data from WAQI (World Air Quality Index) API
      const waqiResponse = await fetch(
        `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${API_KEYS.WAQI_API_TOKEN}`
      )
      
      if (!waqiResponse.ok) {
        throw new Error('Failed to fetch air quality data')
      }
      
      const waqiData = await waqiResponse.json()
      if (waqiData.status !== 'ok') {
        throw new Error('Invalid response from WAQI API')
      }
      
      // Use city name from WAQI if available
      let locationName = "Your Location"
      if (waqiData.data?.city?.name) {
        locationName = waqiData.data.city.name
      }
      
      const aqi = waqiData.data.aqi as number
      const pollutionLevel = determinePollutionLevel(aqi)
      
      // Extract pollutant concentrations if available
      const iaqi = waqiData.data.iaqi || {}
      const pm25 = iaqi.pm25?.v ?? 0
      const pm10 = iaqi.pm10?.v ?? 0
      const o3 = iaqi.o3?.v ?? 0
      const no2 = iaqi.no2?.v ?? 0
      
      const newPollutionData: PollutionData = {
        aqi: aqi,
        level: pollutionLevel,
        pollutants: {
          pm25,
          pm10,
          o3,
          no2,
        },
        healthEffects: getHealthEffects(pollutionLevel),
        location: locationName,
        lastUpdated: waqiData.data.time?.s || new Date().toLocaleString(),
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
                            "text-white",
                            "hover:bg-[#14B8A6]"
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
                          "text-white",
                          "hover:bg-[#14B8A6]"
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
