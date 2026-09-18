import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import {
  AlertTriangle,
  Compass,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { ACTIVE_CLUSTERS, type OutbreakCluster } from "@/lib/av360/surveillance";
import { cn } from "@/lib/utils";

interface Props {
  selectedCluster: OutbreakCluster;
  onSelectCluster: (cluster: OutbreakCluster) => void;
  filterBlock?: string;
}

const TALUK_FACILITIES = [
  {
    name: "District Diagnostic Laboratory (DDL) Kolar",
    coords: [13.141, 78.135] as [number, number],
    type: "Lab",
  },
  {
    name: "Taluk Veterinary Dispensary Malur",
    coords: [13.001, 77.942] as [number, number],
    type: "Clinic",
  },
  {
    name: "Taluk Veterinary Dispensary Srinivaspur",
    coords: [13.336, 78.212] as [number, number],
    type: "Clinic",
  },
  {
    name: "Taluk Veterinary Dispensary Bangarapet",
    coords: [12.984, 78.195] as [number, number],
    type: "Clinic",
  },
  {
    name: "Taluk Veterinary Dispensary Mulbagal",
    coords: [13.161, 78.394] as [number, number],
    type: "Clinic",
  },
];

export function OpenStreetMapGIS({ selectedCluster, onSelectCluster, filterBlock }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circlesRef = useRef<L.Circle[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const facilitiesRef = useRef<L.Marker[]>([]);

  const [showBuffers, setShowBuffers] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [mapStyle, setMapStyle] = useState<"osm" | "carto">("carto");
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Leaflet Map safely in browser environment
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet's default icon path issue in bundled applications
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Avoid re-initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map centered on Kolar District
      const map = L.map(mapContainerRef.current, {
        center: [13.1367, 78.1292],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Custom Zoom Control at Top-Right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: "bottomright" })
        .addAttribution(
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · AVS 360 GIS',
        )
        .addTo(map);

      // Mousemove coordinate tracking
      map.on("mousemove", (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4)),
        });
      });

      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      // Remove previous tile layer
      map.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      const tileUrl =
        mapStyle === "osm"
          ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: "abc",
      }).addTo(map);
    });
  }, [mapStyle, isLoaded]);

  // Render Outbreak Clusters, 3km/5km Ring Buffers, and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      // Clear old layers
      circlesRef.current.forEach((c) => c.remove());
      markersRef.current.forEach((m) => m.remove());
      circlesRef.current = [];
      markersRef.current = [];

      ACTIVE_CLUSTERS.forEach((cluster) => {
        const [lat, lng] = cluster.coordinates;
        const isCritical = cluster.severity === "CRITICAL";
        const isHigh = cluster.severity === "HIGH";
        const isSelected = selectedCluster.id === cluster.id;

        const color = isCritical ? "#dc2626" : isHigh ? "#f59e0b" : "#10b981";
        const fillColor = isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#10b981";

        // 1. Draw Ring Buffer Circle (3,000m or 5,000m)
        if (showBuffers) {
          const radiusMeters = cluster.vaccinationRingKm * 1000;
          const circle = L.circle([lat, lng], {
            radius: radiusMeters,
            color: color,
            weight: isSelected ? 2.5 : 1.5,
            dashArray: isCritical ? "6, 6" : undefined,
            fillColor: fillColor,
            fillOpacity: isSelected ? 0.22 : 0.12,
          }).addTo(map);

          circle.on("click", () => {
            onSelectCluster(cluster);
          });

          circlesRef.current.push(circle);
        }

        // 2. Custom HTML Marker with Pulse Animation
        const markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-epi-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Interactive Popup
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 font-sans text-slate-900";
        popupContent.innerHTML = `
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">
            ${cluster.severity} OUTBREAK PERIMETER
          </div>
          <div style="font-size: 13px; font-weight: 800; margin-top: 2px; color: #0f172a;">
            ${cluster.disease} (${cluster.code})
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            ${cluster.village}, ${cluster.block}
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px; display: flex; justify-content: space-between;">
            <span>Reported Cases: <strong>${cluster.reportedCases}</strong></span>
            <span>Mortalities: <strong style="color: #dc2626;">${cluster.mortalityCount}</strong></span>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #059669;">
            Ring Vaccination: <strong>${cluster.vaccinationCoveragePct}%</strong> (${cluster.vaccinationRingKm}km buffer)
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          onSelectCluster(cluster);
        });

        markersRef.current.push(marker);
      });
    });
  }, [showBuffers, selectedCluster, isLoaded, onSelectCluster]);

  // Render Veterinary Dispensaries & Diagnostic Centers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      facilitiesRef.current.forEach((f) => f.remove());
      facilitiesRef.current = [];

      if (!showFacilities) return;

      TALUK_FACILITIES.forEach((fac) => {
        const isLab = fac.type === "Lab";
        const iconColor = isLab ? "#4f46e5" : "#0284c7";

        const facilityHtml = `
          <div style="background-color: ${iconColor}; color: white; border-radius: 6px; padding: 3px 6px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1.5px solid white;">
            <span style="background: rgba(255,255,255,0.25); border-radius: 3px; padding: 1px 3px; font-size: 8px; font-weight: 800;">${isLab ? "LAB" : "VET"}</span>
            <span style="white-space: nowrap;">${fac.name.split(" ")[0]}</span>
          </div>
        `;

        const facIcon = L.divIcon({
          html: facilityHtml,
          className: "custom-fac-marker",
          iconAnchor: [30, 12],
        });

        const m = L.marker(fac.coords, { icon: facIcon }).addTo(map);
        m.bindPopup(
          `<strong>${fac.name}</strong><br/><span style="font-size:11px; color:#64748b;">Official Government Hub</span>`,
        );
        facilitiesRef.current.push(m);
      });
    });
  }, [showFacilities, isLoaded]);

  // Pan to Selected Cluster
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCluster) return;
    map.flyTo(selectedCluster.coordinates, 12, { duration: 1.2 });
  }, [selectedCluster]);

  function handleResetView() {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([13.1367, 78.1292], 10, { duration: 1 });
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">OpenStreetMap Epidemiological GIS</h4>
            <span className="text-[10px] text-slate-500">
              Kolar District Containment Perimeters · WGS-84 Projection
            </span>
          </div>
        </div>

        {/* Layer & Style Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowBuffers(!showBuffers)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              showBuffers
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            <Layers className="h-3 w-3" />
            <span>3km/5km Rings</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFacilities(!showFacilities)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              showFacilities
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            <MapPin className="h-3 w-3" />
            <span>Dispensaries & Labs</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === "carto" ? "osm" : "carto")}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            {mapStyle === "carto" ? "Carto Voyager" : "Standard OSM"}
          </button>

          <button
            type="button"
            onClick={handleResetView}
            title="Reset to District View"
            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative h-[380px] w-full bg-slate-100">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Coordinates HUD Overlay */}
        <div className="absolute bottom-2 left-2 z-20 rounded-md border border-slate-200/80 bg-white/90 px-2 py-1 text-[10px] font-mono text-slate-600 shadow-2xs backdrop-blur-xs">
          <span>
            {cursorCoords
              ? `LAT: ${cursorCoords.lat}°N  LON: ${cursorCoords.lng}°E`
              : "CENTER: 13.1367°N, 78.1292°E"}
          </span>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-slate-800 font-semibold">
              Active Containment Ring (&gt;80% Risk)
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Investigation Perimeter (50-79%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Clear Surveillance Baseline</span>
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500">
          Source: Karnataka AH&VS GIS & OpenStreetMap
        </span>
      </div>
    </div>
  );
}
