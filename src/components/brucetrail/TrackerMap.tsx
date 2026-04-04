"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Runner } from "@/lib/mockData";
import RunnerCard from "./RunnerCard";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';

// Turf.js & GPX Parsers
import { gpx } from "@tmcw/togeojson";
import { lineString } from "@turf/helpers";
import length from "@turf/length";
import along from "@turf/along";

// Next.js dynamic import for react-leaflet boundary
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

// Fallback interpolation for waypoints if no GPX is provided
function interpolate(
  km: number, 
  wp1: { km: number, lat: number, lng: number }, 
  wp2: { km: number, lat: number, lng: number }
): [number, number] {
  const percent = (km - wp1.km) / (wp2.km - wp1.km);
  const lat = wp1.lat + (wp2.lat - wp1.lat) * percent;
  const lng = wp1.lng + (wp2.lng - wp1.lng) * percent;
  return [lat, lng];
}

interface TrackerMapProps {
  runners: Runner[];
  waypoints: { id: number; name: string; km: number; lat: number; lng: number }[];
  totalDistance: number;
}

export default function TrackerMap({ runners, waypoints, totalDistance }: TrackerMapProps) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [L, setL] = useState<any>(null);
  const [gpxLine, setGpxLine] = useState<any>(null);
  const [gpxCoords, setGpxCoords] = useState<[number, number][]>([]);
  const [actualGpxLength, setActualGpxLength] = useState<number>(0);

  const formatDist = (val: any) => {
    if (typeof val === 'number') return val.toFixed(1);
    if (!isNaN(Number(val))) return Number(val).toFixed(1);
    return String(val);
  };

  useEffect(() => {
    import('leaflet').then(leaflet => {
      setL(leaflet);
    });

    // Attempt to load the user's raw GPX file
    fetch('/brucetrail.gpx')
      .then(res => {
        if (!res.ok) throw new Error("GPX file not found.");
        return res.text();
      })
      .then(xmlStr => {
        const doc = new window.DOMParser().parseFromString(xmlStr, "text/xml");
        const geojson: any = gpx(doc);
        
        let pathLine: any = null;
        let coords: [number, number][] = [];
        
        // Extract LineString coordinates heavily smoothed from GPX
        for (const feature of geojson.features) {
          if (feature.geometry?.type === "LineString") {
             const geocoords: any[] = feature.geometry.coordinates;
             pathLine = lineString(geocoords);
             coords = geocoords.map(c => [c[1], c[0]]); // Swap to [lat, lng]
             break;
          } else if (feature.geometry?.type === "MultiLineString") {
             let merged: any[] = [];
             for (const segment of feature.geometry.coordinates as any[][]) {
                merged = merged.concat(segment);
             }
             pathLine = lineString(merged);
             coords = merged.map(c => [c[1], c[0]]);
             break;
          }
        }
        
        if (pathLine && coords.length > 0) {
          const totalKm = length(pathLine, { units: 'kilometers' });
          setActualGpxLength(totalKm);
          setGpxLine(pathLine);
          setGpxCoords(coords);
          console.log("[GPX SYSTEM] Loaded high-res tracking topology. Total length:", totalKm.toFixed(2), "KM");
        }
      })
      .catch(err => {
        console.warn("[GPX MISSING] No 'brucetrail.gpx' file loaded yet. Falling back to linear waypoints.");
      });
  }, []);

  const groupedRunners = useMemo(() => {
    const groups: { [locationKm: number]: Runner[] } = {};
    if (runners) {
      runners.forEach(r => {
        const snapDist = Math.round(r.locationKm); 
        if (!groups[snapDist]) groups[snapDist] = [];
        groups[snapDist].push(r);
      });
    }
    return groups;
  }, [runners]);

  const getLatLngForDistance = (dist: number): [number, number] => {
    // Precise Turf.js topographic calculation hugging the true GPX curves!
    if (gpxLine && actualGpxLength > 0) {
      // Scale runner norm relative to true GPX length
      const scaledDist = dist * (actualGpxLength / totalDistance);
      const safeDist = Math.max(0, Math.min(scaledDist, actualGpxLength));
      
      const point: any = along(gpxLine, safeDist, { units: 'kilometers' });
      return [point.geometry.coordinates[1], point.geometry.coordinates[0]];
    }

    if (!waypoints || waypoints.length === 0) return [44.2, -80.4];

    // Fallback: Straight line mapping between coarse waypoints
    if (dist <= waypoints[0].km) return [waypoints[0].lat, waypoints[0].lng];
    const lastWp = waypoints[waypoints.length - 1];
    if (dist >= lastWp.km) return [lastWp.lat, lastWp.lng];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];
      if (dist >= wp1.km && dist <= wp2.km) {
        return interpolate(dist, wp1, wp2);
      }
    }
    return [waypoints[0].lat, waypoints[0].lng];
  };

  if (!L) {
    return <div className="h-[650px] w-full bg-[#050510] flex items-center justify-center text-[#cca571] animate-pulse font-mono focus:outline-none">LOADING TACTICAL MAP_</div>;
  }

  const createMarkerIcon = (runners: Runner[], groupDist: number) => {
    const isSelected = selectedGroup === groupDist;
    const extraCount = runners.length > 3 ? runners.length - 3 : 0;
    
    let html = `<div class="relative flex items-center justify-center focus:outline-none">`;
    runners.slice(0, 3).forEach((r, i) => {
      html += `
        <div style="position: ${i>0 ? 'absolute' : 'relative'}; left: ${i>0 ? i*-8 : 0}px; z-index: ${10-i}" class="w-10 h-10 rounded-full border-2 ${isSelected ? 'border-[#ff003c]' : 'border-[#00f0ff]'} overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)] bg-black">
          ${r.avatar ? `<img src="${r.avatar}" class="w-full h-full object-cover"/>` : `<div class="w-full h-full flex justify-center items-center text-[#cca571] font-bold text-xs">${r.name[0]}</div>`}
        </div>
      `;
    });
    if (extraCount > 0) {
      html += `<div class="absolute -top-2 -right-2 bg-[#ff003c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-20 shadow-[0_0_5px_#ff003c]">+${extraCount}</div>`;
    }
    html += `</div>`;

    return L.divIcon({
      html,
      className: 'bg-transparent border-none outline-none focus:outline-none',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  // Base linear path vs Dense curvy topological path
  const polylinePositions = gpxCoords.length > 0 
      ? gpxCoords 
      : (waypoints ? waypoints.map(wp => [wp.lat, wp.lng] as [number, number]) : []);

  return (
    <div className="relative w-full mx-auto min-h-[650px] h-[75vh] mb-4 border border-[#1a3a4c] overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-[#0a0a0f]">
      <MapContainer 
        center={[44.2, -80.4]} 
        zoom={7} 
        scrollWheelZoom={true}
        className="w-full h-full z-0 focus:outline-none"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />

        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: '#00f0ff', weight: 4, dashArray: gpxCoords.length > 0 ? '' : '4, 8', opacity: 0.5 }} 
        />
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: '#ff003c', weight: 2, className: 'animate-pulse' }} 
        />

        {!gpxLine && waypoints && waypoints.map(wp => (
          <CircleMarker 
            key={wp.id} 
            center={[wp.lat, wp.lng]} 
            radius={4} 
            pathOptions={{ color: '#cca571', fillColor: '#000', fillOpacity: 1, weight: 2 }}
          >
            <Popup className="font-mono text-center outline-none">
              <span className="text-[#00f0ff] text-xs font-bold">{wp.name}</span><br/>
              <span className="text-gray-400 text-[10px]">KM: {wp.km}</span>
            </Popup>
          </CircleMarker>
        ))}

        {Object.entries(groupedRunners).map(([distStr, runners]) => {
          const dist = parseFloat(distStr);
          const position = getLatLngForDistance(dist);
          const icon = createMarkerIcon(runners, dist);

          return (
            <Marker 
              key={distStr} 
              position={position} 
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedGroup(dist);
                },
              }}
            >
              <Popup closeButton={false} className="custom-popup bg-transparent focus:outline-none outline-none">
                 <div className="w-64 max-h-[300px] overflow-y-auto outline-none border-none">
                   <h3 className="text-[#ff003c] font-display text-sm tracking-widest mb-2 border-b border-[#ff003c] inline-block">🎯 MAP_LOC: {dist.toFixed(1)} KM</h3>
                   {runners.map((r, i) => (
                     <div key={i} className="mb-3 flex items-start gap-3 outline-none">
                       <img src={r.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-[#00f0ff]" />
                       <div>
                          <p className="text-[#00f0ff] font-bold text-sm leading-none">{r.name} <span className="text-gray-500 font-mono text-[10px] ml-1">{r.class}</span></p>
                          <p className="text-gray-400 font-mono text-[10px] mt-1">累积推进: {formatDist(r.progressDist)} KM | 总跑量: {formatDist(r.totalDist)} KM</p>
                          <p className="text-white font-mono text-xs mt-1 bg-[#111] px-1 border-l-2 border-[#cca571]">&quot;{r.status}&quot;</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] -translate-x-1/2 -translate-y-1/2 border border-[#00f0ff]/10 pointer-events-none z-10 flex items-center justify-center">
         <div className="w-full h-[1px] bg-[#00f0ff]/5 absolute top-1/2 left-0" />
         <div className="w-[1px] h-full bg-[#00f0ff]/5 absolute top-0 left-1/2" />
         <div className="absolute top-0 right-0 p-2 text-[#00f0ff]/30 text-[10px] font-mono tracking-widest bg-black/50 border border-[#00f0ff]/10">
           SAT: CARTO_NIGHT
           {gpxLine && <div className="text-[#00ff00]">GPX: HIGH_RES_ACTIVE</div>}
         </div>
      </div>
    </div>
  );
}
