"use client";

import { useState } from "react";
import Link from "next/link";
import { GameHistoryEntry, RARITY_COLORS } from "@/types";

export default function HistoryPage() {
  const [history] = useState<GameHistoryEntry[]>([]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">Game History</h1>
      <p className="text-gray-400 mb-8">
        Your recent upgrade attempts. History is stored locally during the
        session.
      </p>

      {history.length === 0 ? (
        <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-400 text-lg">No games played yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Go to the Upgrader page and start playing!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Play Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`bg-[#12122a] rounded-xl border p-4 flex items-center gap-4 ${
                entry.won
                  ? "border-green-500/30"
                  : "border-red-500/30"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${
                  entry.won
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {entry.won ? "W" : "L"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {entry.betSkin.weapon} | {entry.betSkin.name} &rarr;{" "}
                  {entry.targetSkin.weapon} | {entry.targetSkin.name}
                </p>
                <p className="text-xs text-gray-400">
                  Chance: {entry.chance.toFixed(2)}% | Roll:{" "}
                  {entry.roll.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="font-bold"
                  style={{
                    color: RARITY_COLORS[entry.targetSkin.rarity],
                  }}
                >
                  ${entry.targetSkin.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
