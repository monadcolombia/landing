"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { CITIES } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

export default function MapColombia() {
  useEffect(() => {
    // Fix Leaflet default icon issue in Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
  }, []);

  return (
    <MapContainer
      center={[7.0, -74.5]}
      zoom={6}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl={false}
      className="h-full w-full rounded-xl"
      style={{ background: "transparent" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      {CITIES.filter(
        (city, index, all) =>
          all.findIndex((other) => other.lat === city.lat && other.lng === city.lng) === index
      ).map((city) => (
        <CircleMarker
          key={city.id}
          center={[city.lat, city.lng]}
          radius={city.confirmed ? 10 : 5}
          pathOptions={{
            fillColor: city.confirmed ? "#6E54FF" : "#FFFFFF",
            fillOpacity: city.confirmed ? 0.7 : 0.4,
            color: city.confirmed ? "#6E54FF" : "#FFFFFF",
            weight: 1,
          }}
          eventHandlers={{
            click: () => {
              document.getElementById(`city-${city.id}`)?.scrollIntoView({ behavior: "smooth" });
            },
          }}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
            className="!bg-monad-dark !text-white !border-monad-primary !rounded-md !text-xs !font-bold"
          >
            {city.name}
            {city.confirmed && " ✦"}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
