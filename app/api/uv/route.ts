import { NextRequest, NextResponse } from "next/server";

const OPENUV_API_KEY = process.env.OPENUV_API_KEY || process.env.NEXT_PUBLIC_OPENUV_API_KEY || "";
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";
const WAQI_API_TOKEN = process.env.WAQI_API_TOKEN || process.env.NEXT_PUBLIC_WAQI_API_TOKEN || "";

const OPENUV_BASE_URL = process.env.OPENUV_API_URL || process.env.NEXT_PUBLIC_OPENUV_API_URL || "https://api.openuv.io/api/v1";
const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_API_URL || process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || "https://api.openweathermap.org/data/2.5";
const WAQI_BASE_URL = process.env.WAQI_API_URL || process.env.NEXT_PUBLIC_WAQI_API_URL || "https://api.waqi.info/feed";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon") || searchParams.get("lng");

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, message: "Missing required 'lat' and 'lon' query parameters" },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, message: "Invalid 'lat' or 'lon' coordinates provided" },
        { status: 400 }
      );
    }

    // 1. Resolve Location Name (via OpenWeather Reverse Geocoding if available)
    let locationName = "Your Location";
    if (OPENWEATHER_API_KEY) {
      try {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData?.[0]?.name) {
            locationName = geoData[0].name;
          }
        }
      } catch (err) {
        console.warn("Reverse geocoding failed:", err);
      }
    }

    // 2. Fetch UV Index (OpenUV first, OpenWeather fallback, or simulated fallback)
    let uvIndex: number | null = null;
    let uvSource = "Estimated";

    if (OPENUV_API_KEY && OPENUV_API_KEY !== "your_openuv_key_here") {
      try {
        const uvRes = await fetch(
          `${OPENUV_BASE_URL}/uv?lat=${latitude}&lng=${longitude}`,
          {
            headers: {
              "x-access-token": OPENUV_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        if (uvRes.ok) {
          const uvData = await uvRes.json();
          if (uvData?.result?.uv !== undefined) {
            uvIndex = Math.round(uvData.result.uv);
            uvSource = "OpenUV";
          }
        }
      } catch (err) {
        console.warn("OpenUV fetch failed, falling back:", err);
      }
    }

    // Fallback to OpenWeather for UV if OpenUV didn't succeed
    if (uvIndex === null && OPENWEATHER_API_KEY) {
      try {
        const owRes = await fetch(
          `${OPENWEATHER_BASE_URL}/uvi?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
        );
        if (owRes.ok) {
          const owData = await owRes.json();
          if (owData?.value !== undefined) {
            uvIndex = Math.round(owData.value);
            uvSource = "OpenWeather";
          }
        }
      } catch (err) {
        console.warn("OpenWeather UV fetch failed:", err);
      }
    }

    // If both failed or neither key configured, estimate a reasonable default based on coordinates/time
    if (uvIndex === null) {
      uvIndex = 5; // Default moderate estimate
      uvSource = "Estimated";
    }

    // 3. Fetch Air Quality (WAQI)
    let pollutionData = {
      aqi: 45, // Default good/moderate fallback
      pollutants: { pm25: 12, pm10: 25, o3: 20, no2: 15 },
      location: locationName,
      source: "Estimated",
    };

    if (WAQI_API_TOKEN) {
      try {
        const waqiRes = await fetch(
          `${WAQI_BASE_URL}/geo:${latitude};${longitude}/?token=${WAQI_API_TOKEN}`
        );
        if (waqiRes.ok) {
          const waqiJson = await waqiRes.json();
          if (waqiJson.status === "ok" && waqiJson.data) {
            const data = waqiJson.data;
            const iaqi = data.iaqi || {};
            pollutionData = {
              aqi: typeof data.aqi === "number" ? data.aqi : 45,
              pollutants: {
                pm25: iaqi.pm25?.v ?? 0,
                pm10: iaqi.pm10?.v ?? 0,
                o3: iaqi.o3?.v ?? 0,
                no2: iaqi.no2?.v ?? 0,
              },
              location: data.city?.name || locationName,
              source: "WAQI",
            };
          }
        }
      } catch (err) {
        console.warn("WAQI fetch failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      uv: {
        index: uvIndex,
        source: uvSource,
        location: locationName,
      },
      pollution: pollutionData,
    });
  } catch (error: any) {
    console.error("Error in /api/uv proxy route:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during environmental data fetch",
      },
      { status: 500 }
    );
  }
}
