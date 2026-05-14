// LocationPicker.tsx — Leaflet-based (free, no API key required)
import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  location: Location | null;
  onChange: (location: Location) => void;
}

const defaultLocation = { latitude: 40.7128, longitude: -74.006 };

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
}) => {
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    location?.latitude || defaultLocation.latitude,
    location?.longitude || defaultLocation.longitude,
  ]);

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      onChange({ latitude: lat, longitude: lng });
    },
    [onChange]
  );

  return (
    <MapContainer
      center={[
        location?.latitude || defaultLocation.latitude,
        location?.longitude || defaultLocation.longitude,
      ]}
      zoom={12}
      scrollWheelZoom
      style={{ width: "100%", height: "300px", borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={markerPos} />
      <ClickHandler onSelect={handleClick} />
    </MapContainer>
  );
};

export default LocationPicker;
