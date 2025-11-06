"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Terminal, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// ✅ Dynamically import Map component (to prevent SSR issues)
const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function HomePage() {
  const [ip, setIp] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [matrixRain, setMatrixRain] = useState([]);

  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 20);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);
    setMatrixRain(drops);

    const interval = setInterval(() => {
      setMatrixRain(prev => prev.map((y, i) => 
        y > 100 + Math.random() * 100 ? 0 : y + 0.5
      ));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const validateIP = (ipAddress) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    
    const privateIPv4Ranges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^0\./
    ];

    const localIPv6Patterns = [
      /^fe80:/i,
      /^fc00:/i,
      /^fd00:/i,
      /^::1$/,
      /^::$/
    ];

    if (macRegex.test(ipAddress)) {
      return { valid: false, error: "NETWORK_ID_DETECTED", message: "⚠️ ACCESS DENIED: Cannot trace MAC addresses" };
    }

    if (ipv4Regex.test(ipAddress)) {
      const parts = ipAddress.split('.').map(Number);
      if (parts.some(p => p > 255)) {
        return { valid: false, error: "INVALID_FORMAT", message: "⚠️ INVALID IP: Octet value exceeds 255" };
      }
      
      if (privateIPv4Ranges.some(pattern => pattern.test(ipAddress))) {
        return { valid: false, error: "PRIVATE_NETWORK", message: "⚠️ ACCESS DENIED: Private network IP detected" };
      }
      
      return { valid: true };
    }

    if (ipv6Regex.test(ipAddress)) {
      if (localIPv6Patterns.some(pattern => pattern.test(ipAddress))) {
        return { valid: false, error: "PRIVATE_NETWORK", message: "⚠️ ACCESS DENIED: Local IPv6 address detected" };
      }
      return { valid: true };
    }

    return { valid: false, error: "INVALID_FORMAT", message: "⚠️ INVALID INPUT: Not a valid IP address format" };
  };

  const lookup = async () => {
    if (!ip.trim()) {
      setValidationError("⚠️ INPUT REQUIRED");
      setAccessStatus("denied");
      setTimeout(() => {
        setValidationError("");
        setAccessStatus("");
      }, 3000);
      return;
    }

    const validation = validateIP(ip.trim());
    
    if (!validation.valid) {
      setValidationError(validation.message);
      setAccessStatus("denied");
      setInfo(null);
      setLat(null);
      setLon(null);
      setTimeout(() => {
        setValidationError("");
        setAccessStatus("");
      }, 4000);
      return;
    }

    setLoading(true);
    setInfo(null);
    setValidationError("");
    setAccessStatus("scanning");

    try {
      const res = await fetch(`/api/lookup?ip=${ip}`);
      const json = await res.json();

      if (json.success) {
        setAccessStatus("granted");
        setTimeout(() => {
          setInfo(json.data);
          setLat(json.data.latitude);
          setLon(json.data.longitude);
        }, 1000);
      } else {
        setAccessStatus("denied");
        setValidationError("⚠️ LOOKUP FAILED: " + (json.error || "Unknown error"));
        setTimeout(() => {
          setValidationError("");
          setAccessStatus("");
        }, 3000);
      }
    } catch (error) {
      setAccessStatus("denied");
      setValidationError("⚠️ NETWORK ERROR: Connection failed");
      setTimeout(() => {
        setValidationError("");
        setAccessStatus("");
      }, 3000);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      lookup();
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-green-400 overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {matrixRain.map((y, i) => (
          <div
            key={i}
            className="absolute text-green-500 font-mono text-sm"
            style={{
              left: `${i * 20}px`,
              top: `${y}%`,
              transform: 'translateY(-100%)',
            }}
          >
            {String.fromCharCode(Math.random() * 94 + 33)}
          </div>
        ))}
      </div>

      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse" 
           style={{ backgroundSize: '100% 4px', animation: 'scan 8s linear infinite' }}></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Terminal className="w-12 h-12 text-green-400 animate-pulse" />
            <h1 className="text-5xl font-bold tracking-wider glitch" data-text="IP TRACER">
              IP TRACER
            </h1>
            <Shield className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
          <p className="text-green-500 font-mono tracking-widest">NETWORK INTELLIGENCE SYSTEM v3.7</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-xs text-green-600 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Input Section */}
<div className="w-full max-w-2xl mb-8">
  <div className="border-2 border-green-500 rounded-lg p-4 sm:p-6 bg-black/80 backdrop-blur-sm shadow-2xl shadow-green-500/20">
    <div className="mb-4">
      <label className="block text-sm font-mono text-green-500 mb-2 sm:mb-3">TARGET IP ADDRESS</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="XXX.XXX.XXX.XXX"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full bg-black border-2 border-green-600 rounded px-3 sm:px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/50 transition-all text-base sm:text-lg"
        />
        <button
          onClick={lookup}
          disabled={loading}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-black font-bold rounded transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50 hover:shadow-green-400/70 disabled:shadow-none font-mono tracking-wider text-base sm:text-lg whitespace-nowrap"
        >
          {loading ? "SCANNING..." : "INITIATE"}
        </button>
      </div>
    </div>

    {/* Access Status - Made responsive */}
    {accessStatus === "scanning" && (
      <div className="mt-4 p-3 sm:p-4 border-2 border-yellow-500 rounded bg-yellow-500/10 animate-pulse">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 sm:border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-yellow-400 font-mono text-sm sm:text-base">SCANNING NETWORK...</span>
        </div>
      </div>
    )}

    {accessStatus === "granted" && (
      <div className="mt-4 p-3 sm:p-4 border-2 border-green-500 rounded bg-green-500/10 animate-slide-up">
        <div className="flex items-center gap-2 sm:gap-3">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          <span className="text-green-400 font-mono text-sm sm:text-base">✓ ACCESS GRANTED</span>
        </div>
      </div>
    )}

    {accessStatus === "denied" && (
      <div className="mt-4 p-3 sm:p-4 border-2 border-red-500 rounded bg-red-500/10 animate-shake">
        <div className="flex items-center gap-2 sm:gap-3">
          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          <span className="text-red-400 font-mono text-sm sm:text-base">✗ ACCESS DENIED</span>
        </div>
      </div>
    )}

    {validationError && (
      <div className="mt-4 p-3 sm:p-4 border-2 border-red-500 rounded bg-red-500/10 animate-shake">
        <div className="flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          <span className="text-red-400 font-mono text-sm sm:text-base break-words">{validationError}</span>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Results Section Done*/}
        {info && (
          <div className="w-full max-w-6xl animate-slide-up">
            <div className="border-2 border-green-500 rounded-lg p-6 bg-black/80 backdrop-blur-sm shadow-2xl shadow-green-500/20 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-green-400 font-mono tracking-wider flex items-center gap-3">
                <Terminal className="w-6 h-6" />
                INTELLIGENCE REPORT
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { label: "IP ADDRESS", value: info.ip },
                  { label: "LOCATION", value: info.city },
                  { label: "REGION", value: info.region },
                  { label: "COUNTRY", value: info.country_name },
                  { label: "LATITUDE", value: info.latitude },
                  { label: "LONGITUDE", value: info.longitude },
                  { label: "ISP PROVIDER", value: info.org },
                  { label: "TIMEZONE", value: info.timezone }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-green-700 rounded bg-black/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30 transition-all animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="text-green-600 text-xs font-mono mb-1">{item.label}</div>
                    <div className="text-green-300 font-mono text-lg">{item.value || "N/A"}</div>
                  </div>
                ))}
              </div>

              {lat && lon && (
                <div className="mt-4 p-4 border border-green-700 rounded bg-black/50">
                  <div className="text-green-600 text-sm font-mono mb-3">GEOLOCATION COORDINATES</div>
                  <div className="text-green-400 font-mono">
                    📍 {lat}°N, {lon}°E
                  </div>
                </div>
              )}
            </div>

            {/* Map Component */}
            {lat && lon && (
              <div className="border-2 border-green-500 rounded-lg overflow-hidden bg-black/80 backdrop-blur-sm shadow-2xl shadow-green-500/20 animate-slide-up">
                <div className="p-4 border-b border-green-700 bg-black/50">
                  <h3 className="text-xl font-bold text-green-400 font-mono tracking-wider flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    GEOLOCATION VISUALIZATION
                  </h3>
                </div>
                <div className="h-96 w-full">
                  <Map lat={lat} lon={lon} />
                </div>
                <br/>
                <div className="p-3 border-t border-green-700 bg-black/50">
                  <div className="text-green-600 text-xs font-bold text-center">
                    LIVE COORDINATES: {lat}°N, {lon}°E
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-green-700 font-bold text-sm">
          <p>⚠️ FOR AUTHORIZED USE ONLY ⚠️</p>
          <p className="mt-2">SYSTEM PROTECTED BY MILITARY-GRADE ENCRYPTION</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .glitch {
          position: relative;
          text-shadow: 0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0;
        }

        .glitch:hover {
          animation: glitch 0.3s ease-in-out infinite;
        }

        @keyframes glitch {
          0% { text-shadow: 0 0 10px #0f0; }
          25% { text-shadow: -2px 0 10px #f00, 2px 0 10px #00f; }
          50% { text-shadow: 2px 0 10px #0f0; }
          75% { text-shadow: -2px 0 10px #00f, 2px 0 10px #f00; }
          100% { text-shadow: 0 0 10px #0f0; }
        }
      `}</style>
    </div>
  ); 
}