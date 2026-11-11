"use client";

import { useCallback, useMemo, useState } from "react";
import shelterData from "@/data/shelters.json";
import ShelterMap from "./ShelterMap";

const { shelters } = shelterData;
const wards = Array.from(new Set(shelters.map((shelter) => shelter.ward)));

export type Shelter = (typeof shelters)[number];
export type ShelterSelection = { id: string; moveMap: boolean };

export default function ShelterExplorer() {
  const [query, setQuery] = useState("");
  const [ward, setWard] = useState("");
  const [selection, setSelection] = useState<ShelterSelection | null>(null);

  const nameQuery = query.normalize("NFKC").trim().toLowerCase();
  const visibleShelters = useMemo(
    () => shelters.filter(
      (shelter) =>
        shelter.name.normalize("NFKC").toLowerCase().includes(nameQuery) &&
        (ward === "" || shelter.ward === ward),
    ),
    [nameQuery, ward],
  );

  const selectMarker = useCallback((id: string) => {
    setSelection({ id, moveMap: false });
  }, []);
  const clearSelection = useCallback(() => setSelection(null), []);

  function selectResult(id: string) {
    setSelection({ id, moveMap: true });
    document.getElementById("shelter-map")?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="shelter-explorer">
      <section aria-labelledby="search-title" className="shelter-search rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <h2 id="search-title" className="mb-4 text-base font-bold">避難所を探す</h2>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            施設名
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                clearSelection();
              }}
              placeholder="例：中央小学校"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-base font-normal placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-800 md:text-sm"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            区
            <select
              value={ward}
              onChange={(event) => {
                setWard(event.target.value);
                clearSelection();
              }}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-800 md:text-sm"
            >
              <option value="">掲載中のすべての区</option>
              {wards.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
        <a href="#shelter-results" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy-800 underline underline-offset-4 md:hidden">
          検索結果へ <span aria-hidden="true">↓</span>
        </a>
      </section>

      <ShelterMap
        shelters={visibleShelters}
        selection={selection}
        onSelect={selectMarker}
        onCloseDetails={clearSelection}
      />

      <section
        id="shelter-results"
        aria-labelledby="results-title"
        className="shelter-results scroll-mt-4 self-start rounded-2xl border border-slate-200 bg-white shadow-xs"
      >
        <h2 id="results-title" aria-live="polite" className="flex items-center justify-between gap-2 px-4 py-4 text-base font-bold sm:px-5">
          検索結果 <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-800">{visibleShelters.length}件</span>
        </h2>
        {visibleShelters.length === 0 ? (
          <p className="border-t border-slate-200 px-4 py-4 text-sm text-slate-600 sm:px-5">条件に一致する施設がありません。</p>
        ) : (
          <ul className="divide-y divide-slate-200 border-t border-slate-200">
            {visibleShelters.map((shelter) => (
              <li key={shelter.id}>
                <button
                  type="button"
                  aria-pressed={selection?.id === shelter.id}
                  onClick={() => selectResult(shelter.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-800 aria-pressed:bg-navy-50 sm:px-5"
                >
                  <span>
                    <span className="block text-sm font-bold">{shelter.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-600">{shelter.ward}</span>
                  </span>
                  <span aria-hidden="true" className="text-navy-800">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
