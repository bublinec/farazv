"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./ParishMap.module.css";

// MapLibre uses longitude, latitude; this is the original parish-office location.
const officeCoordinates: [number, number] = [19.1266, 48.5781];
// Church location: https://vvvw.apsida.sk/c/1582/zvolen
const churchCoordinates: [number, number] = [19.125648, 48.578032];
const mapStyle = "https://tiles.openfreemap.org/styles/positron";
const surfaceColors: Record<string, string> = {
  park: "#dce6d7",
  water: "#c7dce4",
  building: "#e4dfd4",
  landuse_residential: "#efede6",
  landcover_wood: "#dce6d7"
};

export function ParishMap({
  address,
  href
}: {
  address: string;
  href: string;
}) {
  return <MapCanvas key={address} address={address} href={href} />;
}

function MapCanvas({ address, href }: { address: string; href: string }) {
  const canvas = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    let resize: ResizeObserver | undefined;
    let loaded = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !loaded) setStatus("unavailable");
    }, 15_000);

    function unavailable() {
      if (!cancelled && !loaded) setStatus("unavailable");
    }

    async function initialize() {
      const maps = await import("maplibre-gl");
      if (cancelled || !canvas.current) return;

      maps.setWorkerUrl(
        new URL(
          "maplibre-gl/dist/maplibre-gl-worker.mjs",
          import.meta.url
        ).toString()
      );

      const currentMap = new maps.Map({
        container: canvas.current,
        style: mapStyle,
        center: [
          (officeCoordinates[0] + churchCoordinates[0]) / 2,
          (officeCoordinates[1] + churchCoordinates[1]) / 2
        ],
        zoom: 16.5,
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: true,
        attributionControl: { compact: false },
        locale: {
          "NavigationControl.ZoomIn": "Priblížiť",
          "NavigationControl.ZoomOut": "Oddialiť",
          "FullscreenControl.Enter": "Zväčšiť mapu",
          "FullscreenControl.Exit": "Zmenšiť mapu",
          "CooperativeGesturesHandler.MobileHelpText":
            "Mapu posuniete dvoma prstami."
        },
        transformStyle: (_previous, next) => ({
          ...next,
          layers: next.layers.map((layer) => {
            if (layer.type === "background")
              return {
                ...layer,
                paint: { ...layer.paint, "background-color": "#f5f3ed" }
              };
            if (layer.type === "fill" && surfaceColors[layer.id])
              return {
                ...layer,
                paint: { ...layer.paint, "fill-color": surfaceColors[layer.id] }
              };
            return layer;
          })
        })
      });
      map = currentMap;
      currentMap.touchZoomRotate.disableRotation();
      currentMap
        .getCanvas()
        .setAttribute(
          "aria-label",
          `Mapa kostola sv. Alžbety a farskej kancelárie: ${address}`
        );
      currentMap.addControl(
        new maps.NavigationControl({ showCompass: false }),
        "bottom-right"
      );
      currentMap.addControl(new maps.FullscreenControl(), "top-right");

      for (const place of [
        {
          coordinates: officeCoordinates,
          label: "Farská kancelária",
          className: styles.officeMarker
        },
        {
          coordinates: churchCoordinates,
          label: "Kostol sv. Alžbety",
          className: styles.churchMarker
        }
      ]) {
        const marker = document.createElement("div");
        marker.className = `${styles.marker} ${place.className}`;
        marker.setAttribute("aria-hidden", "true");
        const pin = document.createElement("span");
        pin.className = styles.markerPin;
        const label = document.createElement("span");
        label.className = styles.markerLabel;
        label.textContent = place.label;
        marker.append(pin, label);
        new maps.Marker({ element: marker, anchor: "bottom" })
          .setLngLat(place.coordinates)
          .addTo(currentMap);
      }

      currentMap.on("load", () => {
        loaded = true;
        window.clearTimeout(timeout);
        if (!cancelled) setStatus("ready");
      });
      // Isolated tile errors must not cover a map that already loaded.
      currentMap.on("error", unavailable);

      resize = new ResizeObserver(() => currentMap.resize());
      resize.observe(canvas.current);
    }

    void initialize().catch(unavailable);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      resize?.disconnect();
      map?.remove();
    };
  }, [address]);

  return (
    <div className={styles.map}>
      <div
        ref={canvas}
        className={styles.canvas}
        role="region"
        aria-label={`Mapa polohy kostola sv. Alžbety a farskej kancelárie: ${address}`}
        aria-busy={status === "loading"}
        inert={status !== "ready"}
      />
      {status !== "ready" ? (
        <div className={styles.status} role="status">
          {status === "loading" ? (
            <p>Načítavam mapu…</p>
          ) : (
            <>
              <p>Mapu sa nepodarilo načítať.</p>
              <TechnicalSupport />
              <a href={href}>Otvoriť polohu farskej kancelárie na mape →</a>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
