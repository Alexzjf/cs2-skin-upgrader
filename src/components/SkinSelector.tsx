"use client";

import { useState, useMemo } from "react";
import { Skin, SkinRarity } from "@/types";
import SkinCard from "./SkinCard";

interface SkinSelectorProps {
  skins: Skin[];
  selectedSkin: Skin | null;
  onSelect: (skin: Skin) => void;
  label: string;
  filterMinPrice?: number;
  filterMaxPrice?: number;
}

const RARITIES: SkinRarity[] = [
  "Consumer",
  "Industrial",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Contraband",
];

export default function SkinSelector({
  skins,
  selectedSkin,
  onSelect,
  label,
  filterMinPrice,
  filterMaxPrice,
}: SkinSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<SkinRarity | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">(
    "price-asc"
  );

  const filteredSkins = useMemo(() => {
    let filtered = [...skins];

    if (filterMinPrice !== undefined) {
      filtered = filtered.filter((s) => s.price >= filterMinPrice);
    }
    if (filterMaxPrice !== undefined) {
      filtered = filtered.filter((s) => s.price <= filterMaxPrice);
    }

    if (selectedRarity !== "all") {
      filtered = filtered.filter((s) => s.rarity === selectedRarity);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.weapon.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) =>
      sortBy === "price-asc" ? a.price - b.price : b.price - a.price
    );

    return filtered;
  }, [skins, search, selectedRarity, sortBy, filterMinPrice, filterMaxPrice]);

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-4">
      <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">{label}</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[140px] bg-[#0b0f19] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
        />
        <select
          value={selectedRarity}
          onChange={(e) =>
            setSelectedRarity(e.target.value as SkinRarity | "all")
          }
          className="bg-[#0b0f19] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "price-asc" | "price-desc")
          }
          className="bg-[#0b0f19] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredSkins.map((skin) => (
          <SkinCard
            key={skin.id}
            skin={skin}
            selected={selectedSkin?.id === skin.id}
            onClick={() => onSelect(skin)}
            size="sm"
          />
        ))}
        {filteredSkins.length === 0 && (
          <div className="col-span-full text-center text-gray-600 py-8 text-sm">
            No skins found
          </div>
        )}
      </div>
    </div>
  );
}
