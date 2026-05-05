import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon not showing in bundlers like Vite/Webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

/** Reverse-geocode using the free Nominatim API (OpenStreetMap) */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/** Inner component that listens for click events on the map */
function LocationMarker({
  position,
  onSelect,
}: {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect }) => {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      const address = await reverseGeocode(lat, lng);
      onLocationSelect(lat, lng, address);
    },
    [onLocationSelect]
  );

  return (
    <MapContainer
      center={[20.932185, 77.757218]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={markerPos} onSelect={handleMapClick} />
    </MapContainer>
  );
};

export default MapComponent;
