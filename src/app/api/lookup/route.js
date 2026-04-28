// src/app/api/lookup/route.js
import { NextResponse } from "next/server";

// ✅ GET handler for IP lookup using ipinfo.io
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

    // 🌍 Fetch data from IPInfo API using the key from environment variables
    const token = process.env.IPINFO_API_KEY;
    const url = token 
      ? `https://ipinfo.io/${ip}?token=${token}`
      : `https://ipinfo.io/${ip}/json`;

    console.log(`Fetching IP info for: ${ip}`);
    
    const geoRes = await fetch(url);
    
    if (!geoRes.ok) {
      const errorData = await geoRes.json().catch(() => ({}));
      console.error("IPInfo API error:", geoRes.status, errorData);
      return NextResponse.json(
        { error: "Failed to fetch IP info", details: errorData.reason || geoRes.statusText },
        { status: geoRes.status }
      );
    }

    const geoData = await geoRes.json();

    // ✅ Extract and format data for the frontend
    // IPInfo returns 'loc' as "lat,lon"
    const [lat, lon] = (geoData.loc || "0,0").split(",");
    
    const data = {
      ip: geoData.ip,
      city: geoData.city || "N/A",
      region: geoData.region || "N/A",
      country_name: geoData.country || "N/A", // IPInfo uses 2-letter country code
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      org: geoData.org || "N/A",
      timezone: geoData.timezone || "N/A",
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

