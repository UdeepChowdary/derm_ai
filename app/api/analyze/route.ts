import { NextRequest, NextResponse } from "next/server";

const AUTODERM_API_URL = process.env.AUTODERM_API_URL || process.env.NEXT_PUBLIC_AUTODERM_API_URL || "https://autoderm.ai/v1/query";
const AUTODERM_API_KEY = process.env.AUTODERM_API_KEY || process.env.NEXT_PUBLIC_AUTODERM_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Missing required 'file' parameter in FormData" },
        { status: 400 }
      );
    }

    // Get optional query/form parameters with defaults matching the Autoderm spec
    const { searchParams } = new URL(request.url);
    const model = (formData.get("model") as string) || searchParams.get("model") || "autoderm_v2_2";
    const language = (formData.get("language") as string) || searchParams.get("language") || "en";
    const simpleNames = (formData.get("simple_names") as string) || searchParams.get("simple_names") || "true";
    const anonFilter = (formData.get("anon_filter") as string) || searchParams.get("anon_filter") || "false";

    // If no server-side API key is present, signal demo mode to the client
    if (!AUTODERM_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          demoMode: true,
          message: "DEMO_MODE: No Autoderm API key configured on the server.",
        },
        { status: 200 }
      );
    }

    // Build outbound FormData to send to Autoderm AI
    const outboundFormData = new FormData();
    outboundFormData.append("file", file);

    const queryParams = new URLSearchParams({
      model,
      language,
      simple_names: simpleNames,
      anon_filter: anonFilter,
    });

    const targetUrl = `${AUTODERM_API_URL}?${queryParams.toString()}`;

    const apiResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Api-Key": AUTODERM_API_KEY,
      },
      body: outboundFormData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Raw text response
      }

      // Preserve status code for known conditions (e.g. 400 not of skin, 429 rate limit)
      return NextResponse.json(
        {
          success: false,
          status: apiResponse.status,
          message: errorJson?.message || errorJson?.error || errorText || "Autoderm API error",
          error: errorJson || errorText,
        },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/analyze proxy route:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during analysis proxy",
      },
      { status: 500 }
    );
  }
}
