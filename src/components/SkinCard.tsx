"use client";

import { Skin, RARITY_COLORS } from "@/types";

interface SkinCardProps {
  skin: Skin;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function SkinCard({
  skin,
  selected = false,
  onClick,
  size = "md",
}: SkinCardProps) {
  const rarityColor = RARITY_COLORS[skin.rarity];

  const sizeClasses = {
    sm: "w-32 p-2",
    md: "w-44 p-3",
    lg: "w-56 p-4",
  };

  const imgSizes = {
    sm: "h-20",
    md: "h-28",
    lg: "h-36",
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-xl bg-[#1e1e3a] border-2 transition-all duration-200
        hover:scale-105 hover:shadow-lg hover:shadow-[${rarityColor}]/20
        flex flex-col items-center gap-2 group relative overflow-hidden
        ${selected ? "border-orange-400 shadow-lg shadow-orange-400/20" : "border-[#2a2a4a] hover:border-[#3a3a5a]"}
      `}
      style={{
        borderColor: selected ? "#fb923c" : undefined,
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
        style={{ backgroundColor: rarityColor }}
      />

      <div className={`${imgSizes[size]} flex items-center justify-center`}>
        <img
          src={skin.image}
          alt={`${skin.weapon} | ${skin.name}`}
          className="max-h-full max-w-full object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all"
          loading="lazy"
        />
      </div>

      <div className="text-center w-full">
        <p className="text-xs text-gray-400 truncate">{skin.weapon}</p>
        <p className="text-sm font-semibold text-white truncate">{skin.name}</p>
        <p className="text-sm font-bold mt-1" style={{ color: rarityColor }}>
          ${skin.price.toFixed(2)}
        </p>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-black"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
