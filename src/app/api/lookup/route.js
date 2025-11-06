// src/app/api/lookup/route.js
import { NextResponse } from "next/server";

// ✅ GET handler for IP lookup
export async function GET(req) {
  try {
    // Get the IP from the query param (e.g., /api/lookup?ip=8.8.8.8)
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip");

    if (!ip) {
      return NextResponse.json(
        { error: "Missing IP address" },
        { status: 400 }
      );
    }

    // 🌍 Fetch data from IPWHOIS API
    const geoRes = await fetch(`https://ipwho.is/${ip}`);
    const geoData = await geoRes.json();

    // ❌ If lookup failed
    if (!geoData.success) {
      return NextResponse.json(
        { error: "Failed to fetch IP info", details: geoData.message },
        { status: 400 }
      );
    }

    // ✅ Extract useful info
    const data = {
      ip: geoData.ip,
      city: geoData.city,
      region: geoData.region,
      country_name: geoData.country,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      org: geoData.connection?.isp || "N/A",
      timezone: geoData.timezone?.id || geoData.timezone || "N/A",
    };

    // Return the formatted response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API lookup error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
