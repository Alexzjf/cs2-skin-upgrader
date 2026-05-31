"use client";

import { useState } from "react";
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
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const sizeClasses = {
    sm: "w-full p-2",
    md: "w-40 p-3",
    lg: "w-52 p-4",
  };

  const imgSizes = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-lg bg-[#1a2332] border transition-all duration-150
        hover:bg-[#1f2d3d] hover:scale-[1.02]
        flex flex-col items-center gap-1.5 group relative overflow-hidden
        ${selected ? "border-emerald-400 ring-1 ring-emerald-400/30" : "border-[#1f2937] hover:border-[#374151]"}
      `}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: rarityColor }}
      />

      <div className={`${imgSizes[size]} flex items-center justify-center relative w-full`}>
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-full h-full rounded animate-pulse"
              style={{
                background: `linear-gradient(135deg, ${rarityColor}12, ${rarityColor}06)`,
              }}
            />
          </div>
        )}
        {imgError ? (
          <div
            className="w-full h-full rounded flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${rarityColor}15, ${rarityColor}05)`,
            }}
          >
            <span className="text-[10px] text-gray-500">{skin.weapon}</span>
          </div>
        ) : (
          <img
            src={skin.image}
            alt={`${skin.weapon} | ${skin.name}`}
            className={`max-h-full max-w-full object-contain transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="text-center w-full">
        <p className="text-[10px] text-gray-500 truncate">{skin.weapon}</p>
        <p className="text-xs font-medium text-white truncate">{skin.name}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: rarityColor }}>
          ${skin.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
}
