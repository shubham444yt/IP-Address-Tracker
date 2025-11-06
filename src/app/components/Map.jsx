"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// ✅ Dynamically import leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

const Map = ({ lat, lon }) => {
  const [map, setMap] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Custom hacker-style marker icon
  const createHackerMarker = () => {
    if (typeof L === 'undefined') return null;
    
    return L.divIcon({
      className: 'hacker-marker',
      html: `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          background: rgba(0, 255, 0, 0.2);
          border: 2px solid #0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          box-shadow: 0 0 20px #0f0;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #0f0;
            border-radius: 50%;
            box-shadow: 0 0 10px #0f0;
          "></div>
          <div style="
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border: 1px solid #0f0;
            border-radius: 50%;
            animation: ripple 3s infinite;
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // ✅ Automatically update map view when lat/lon changes
  useEffect(() => {
    if (map && lat && lon) {
      setIsScanning(true);
      map.flyTo([lat, lon], 13, { 
        animate: true, 
        duration: 2 
      });
      
      // Add scanning effect completion
      setTimeout(() => {
        setIsScanning(false);
      }, 2000);
    }
  }, [map, lat, lon]);

  // ✅ Handle initial render
  if (!lat || !lon) {
    return (
      <div
        className="relative border-2 border-green-500 rounded-lg bg-black/80 backdrop-blur-sm"
        style={{
          height: "400px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f0",
          fontSize: "1rem",
          fontFamily: "'Courier New', monospace",
          textShadow: "0 0 10px #0f0",
        }}
      >
        {/* Scanning animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center z-10">
          <div className="text-green-400 font-mono mb-2">🛰️ AWAITING COORDINATES</div>
          <div className="text-green-600 text-sm font-mono">
            ENTER TARGET IP TO INITIATE GEOLOCATION SCAN
          </div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div
        className="relative border-2 border-green-500 rounded-lg bg-black/80 backdrop-blur-sm"
        style={{
          height: "400px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f0",
          fontFamily: "'Courier New', monospace",
        }}
      >
        <div className="text-green-400 font-mono">LOADING MAP SYSTEM...</div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "400px", width: "100%" }}>
      {/* Scanning overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-green-400 font-mono text-lg tracking-wider">
              ACQUIRING COORDINATES...
            </div>
            <div className="text-green-600 font-mono text-sm mt-2">
              LAT: {lat}° | LON: {lon}°
            </div>
          </div>
        </div>
      )}

      {/* Coordinates display */}
      <div className="absolute top-4 left-4 z-40 bg-black/80 border border-green-500 rounded px-3 py-2">
        <div className="text-green-400 font-mono text-xs">
          <div>📍 LAT: {lat}°</div>
          <div>📍 LON: {lon}°</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/80 border border-green-500 rounded px-3 py-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-green-400 font-mono text-xs">LIVE TRACKING</span>
      </div>

      <MapContainer
        center={[lat, lon]}
        zoom={13}
        style={{ 
          height: "100%", 
          width: "100%", 
          borderRadius: "10px",
          border: "2px solid #0f0",
          background: "#000"
        }}
        whenCreated={setMap}
        className="hacker-map"
      >
        {/* Use multiple tile layer options for better compatibility */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="hacker-tiles"
        />
        
        {/* Accuracy circle */}
        <Circle
          center={[lat, lon]}
          radius={1000}
          pathOptions={{
            fillColor: "#0f0",
            fillOpacity: 0.1,
            color: "#0f0",
            opacity: 0.6,
            weight: 2,
            dashArray: "5, 5"
          }}
        />
        
        {/* Pulse effect circle */}
        <Circle
          center={[lat, lon]}
          radius={500}
          pathOptions={{
            fillColor: "transparent",
            color: "#0f0",
            opacity: 0.4,
            weight: 1,
            dashArray: "3, 3"
          }}
        />

        <Marker 
          position={[lat, lon]}
          icon={createHackerMarker()}
        >
          <Popup>
            <div className="font-mono text-black p-2">
              <div className="text-sm font-bold text-green-600 mb-1">📍 TARGET ACQUIRED</div>
              <div className="text-xs">
                <div>Latitude: {lat}</div>
                <div>Longitude: {lon}</div>
                <div className="mt-1 text-green-500">Status: ACTIVE TRACKING</div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Grid overlay effect */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden z-30">
        <div 
          className="w-full h-full bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"
          style={{
            background: `
              linear-gradient(90deg, transparent 99%, rgba(0, 255, 0, 0.1) 100%),
              linear-gradient(0deg, transparent 99%, rgba(0, 255, 0, 0.1) 100%)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Radar scan effect */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden z-20">
        <div 
          className="w-full h-full"
          style={{
            background: `conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(0, 255, 0, 0.1) 10deg,
              transparent 20deg
            )`,
            animation: 'radarScan 4s linear infinite'
          }}
        ></div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .hacker-map {
          filter: hue-rotate(90deg) contrast(1.1) brightness(0.9) !important;
        }

        .hacker-tiles {
          filter: hue-rotate(120deg) saturate(1.3) contrast(1.1) brightness(0.8) !important;
        }

        .leaflet-popup-content-wrapper {
          background: #000 !important;
          border: 2px solid #0f0 !important;
          border-radius: 5px !important;
          color: #0f0 !important;
          font-family: 'Courier New', monospace !important;
        }

        .leaflet-popup-tip {
          background: #0f0 !important;
        }

        .leaflet-control-zoom a {
          background: #000 !important;
          border: 1px solid #0f0 !important;
          color: #0f0 !important;
          font-family: 'Courier New', monospace !important;
        }

        .leaflet-control-zoom a:hover {
          background: #0f0 !important;
          color: #000 !important;
        }

        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.8) !important;
          color: #0f0 !important;
          font-family: 'Courier New', monospace !important;
          border: 1px solid #0f0 !important;
          font-size: 10px !important;
        }

        .leaflet-control-attribution a {
          color: #0f0 !important;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes radarScan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Ensure map tiles are visible */
        .leaflet-tile-container img {
          filter: none !important;
        }
      `}</style>
    </div>
  );
};

export default Map;