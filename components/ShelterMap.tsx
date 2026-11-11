"use client";

import { useEffect, useRef, useState } from "react";
import type { LngLatLike, Map } from "maplibre-gl";
import type { Shelter, ShelterSelection } from "./ShelterExplorer";

const SAPPORO_CENTER: LngLatLike = [141.3545, 43.0618]; // [経度, 緯度]
const INITIAL_ZOOM = 12;

type MapRuntime = {
  map: Map;
  Marker: typeof import("maplibre-gl").Marker;
  Popup: typeof import("maplibre-gl").Popup;
};

type ShelterMapProps = {
  shelters: Shelter[];
  selection: ShelterSelection | null;
  onSelect: (id: string) => void;
  onCloseDetails: () => void;
};

export default function ShelterMap({
  shelters,
  selection,
  onSelect,
  onCloseDetails,
}: ShelterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<MapRuntime | null>(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: Map | undefined;
    let cancelled = false;

    // ブラウザで地図の表示領域ができてからライブラリを読み込む。
    async function initializeMap(container: HTMLDivElement) {
      try {
        const { Map, Marker, NavigationControl, Popup } = await import("maplibre-gl");
        if (cancelled) return;

        map = new Map({
          container,
          center: SAPPORO_CENTER,
          zoom: INITIAL_ZOOM,
          style: {
            version: 8,
            sources: {
              "gsi-pale": {
                type: "raster",
                tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
                tileSize: 256,
                maxzoom: 18,
                attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル・淡色地図（国土地理院）</a>',
              },
            },
            layers: [
              { id: "base-map", type: "raster", source: "gsi-pale" },
            ],
          },
        });

        map.addControl(new NavigationControl({ showCompass: false }), "top-right");

        setRuntime({ map, Marker, Popup });
      } catch (error) {
        if (cancelled) return;
        console.error("地図の初期化に失敗しました。", error);
        setMapUnavailable(true);
      }
    }

    void initializeMap(container);

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (!runtime) return;
    const { map, Marker } = runtime;

    const markers = shelters.map((shelter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "grid size-11 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-navy-900";
      button.setAttribute("aria-label", shelter.name);
      const dot = document.createElement("span");
      dot.className = "pointer-events-none size-5 rounded-full border-2 border-white bg-navy-800 shadow-md";
      button.append(dot);
      button.addEventListener("click", () => onSelect(shelter.id));

      return new Marker({ element: button })
        .setLngLat([shelter.longitude, shelter.latitude])
        .addTo(map);
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [runtime, shelters, onSelect]);

  const selected = shelters.find((shelter) => shelter.id === selection?.id);

  useEffect(() => {
    if (!runtime || !selected || !selection) return;
    const { map, Popup } = runtime;
    const center: LngLatLike = [selected.longitude, selected.latitude];

    if (selection.moveMap) {
      map.flyTo({ center, zoom: Math.max(map.getZoom(), 15) });
    }

    const content = document.createElement("div");
    content.className = "grid gap-2 break-words pr-5 text-sm leading-relaxed text-slate-700";
    const title = document.createElement("h2");
    title.className = "text-base font-bold text-navy-900";
    title.textContent = selected.name;
    const details = document.createElement("p");
    details.className = "whitespace-pre-line";
    details.textContent = [
      selected.address,
      `区名：${selected.ward}`,
      `緯度：${selected.latitude}`,
      `経度：${selected.longitude}`,
      ...(selected.category ? [`施設種別：${selected.category}`] : []),
    ].join("\n");
    content.append(title, details);

    const popup = new Popup({ offset: 20, closeOnClick: false, focusAfterOpen: false })
      .setLngLat(center)
      .setDOMContent(content)
      .addTo(map);
    popup.on("close", onCloseDetails);

    return () => {
      popup.off("close", onCloseDetails);
      popup.remove();
    };
  }, [runtime, selected, selection, onCloseDetails]);

  return (
    <section
      id="shelter-map"
      aria-labelledby="map-title"
      className="shelter-map flex min-w-0 scroll-mt-4 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
    >
      <header className="flex min-h-14 items-center justify-between gap-2 border-b border-slate-200 px-4 sm:px-5">
        <h2 id="map-title" className="text-base font-bold">札幌市の地図</h2>
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-navy-800" />
          指定避難所（基幹）
        </span>
      </header>
      <div className="relative flex grow bg-slate-100">
        <div ref={containerRef} className="h-[44svh] min-h-72 w-full md:h-auto md:min-h-[min(63svh,36rem)]" />
        {mapUnavailable && (
          <p role="status" className="absolute inset-0 grid place-items-center px-6 text-center text-sm">
            地図を表示できませんでした。WebGLに対応したブラウザでお試しください。
          </p>
        )}
      </div>
    </section>
  );
}
