import { useEffect, useRef } from "react";
import L from "leaflet";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  kind?: "driver" | "user" | "pickup" | "dropoff";
  label?: string;
};

interface Props {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  followUser?: boolean;
}

const ICONS: Record<NonNullable<MapMarker["kind"]>, L.DivIcon> = {
  driver: L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:#FFCA28;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.25);font-size:18px">🏍️</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  user: L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(37,99,235,.25)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
  pickup: L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:#00C853;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,.25)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  }),
  dropoff: L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:#000;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,.25)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  }),
};

export function OsmMap({
  center = [-1.2921, 36.8219], // Nairobi
  zoom = 14,
  markers = [],
  className,
  onMapClick,
  followUser,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (onMapClick) {
      map.on("click", (e) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    if (followUser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    markers.forEach((m) => {
      const icon = ICONS[m.kind ?? "driver"];
      const marker = L.marker([m.lat, m.lng], { icon });
      if (m.label) marker.bindTooltip(m.label, { direction: "top", offset: [0, -10] });
      marker.addTo(layerRef.current!);
    });
  }, [markers]);

  return <div ref={containerRef} className={className ?? "absolute inset-0"} />;
}
