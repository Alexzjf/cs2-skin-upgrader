"use client";

import { useState, useCallback } from "react";
import { Skin, UpgradeResult, GameHistoryEntry, RARITY_COLORS } from "@/types";
import { skins } from "@/data/skins";
import SkinSelector from "./SkinSelector";
import SkinCard from "./SkinCard";
import UpgradeWheel from "./UpgradeWheel";

export default function UpgradeGame() {
  const [betSkin, setBetSkin] = useState<Skin | null>(null);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<UpgradeResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [balance, setBalance] = useState(100.0);

  const chance =
    betSkin && targetSkin
      ? Math.min((betSkin.price / targetSkin.price) * 100, 95)
      : 0;

  const handleUpgrade = useCallback(async () => {
    if (!betSkin || !targetSkin || isSpinning) return;

    if (balance < betSkin.price) {
      alert("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    setBalance((prev) => prev - betSkin.price);

    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          betSkinId: betSkin.id,
          targetSkinId: targetSkin.id,
        }),
      });

      const data: UpgradeResult = await res.json();
      setResult(data);
    } catch {
      setIsSpinning(false);
      setBalance((prev) => prev + betSkin.price);
    }
  }, [betSkin, targetSkin, isSpinning, balance]);

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setShowResult(true);

    if (result) {
      if (result.won) {
        setBalance((prev) => prev + result.targetSkin.price);
      }

      const entry: GameHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        betSkin: result.betSkin,
        targetSkin: result.targetSkin,
        chance: result.chance,
        won: result.won,
        roll: result.roll,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 50));
    }
  }, [result]);

  const handleReset = () => {
    setBetSkin(null);
    setTargetSkin(null);
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Balance Bar */}
      <div className="flex items-center justify-between bg-[#111827] rounded-lg border border-[#1f2937] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-black">$</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide">Balance</p>
            <p className="text-lg font-bold text-white">${balance.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={() => setBalance((prev) => prev + 100)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          + $100
        </button>
      </div>

      {/* Main Upgrade Area: [Bet Skin] — [Wheel] — [Target Skin] */}
      <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Bet skin */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-gray-500">Your Skin</span>
            {betSkin ? (
              <div className="flex flex-col items-center gap-2">
                <SkinCard skin={betSkin} selected size="lg" />
                <button
                  onClick={() => setBetSkin(null)}
                  className="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="w-44 h-44 rounded-xl border-2 border-dashed border-[#2a3441] flex items-center justify-center text-gray-600">
                <span className="text-xs text-center px-3">Select a skin to bet</span>
              </div>
            )}
          </div>

          {/* Center: Wheel + Button */}
          <div className="flex flex-col items-center gap-4">
            <UpgradeWheel
              chance={chance}
              isSpinning={isSpinning}
              result={result ? { won: result.won, roll: result.roll } : null}
              onSpinComplete={handleSpinComplete}
            />

            {showResult && result ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`rounded-lg border px-5 py-2.5 text-center ${
                    result.won
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-red-500/50 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-xl font-black ${
                      result.won ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.won ? "WIN!" : "LOSE"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Roll: {result.roll.toFixed(2)}
                  </p>
                  {result.won && (
                    <p className="text-sm text-green-300 font-medium">
                      +${result.targetSkin.price.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-lg font-semibold text-sm bg-[#1f2937] hover:bg-[#374151] text-white transition-all border border-[#374151]"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={!betSkin || !targetSkin || isSpinning}
                className={`
                  px-8 py-3 rounded-lg font-bold text-base transition-all
                  ${
                    !betSkin || !targetSkin || isSpinning
                      ? "bg-[#1f2937] text-gray-500 cursor-not-allowed border border-[#374151]"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-400 hover:to-yellow-400 shadow-lg shadow-orange-500/20 active:scale-95"
                  }
                `}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Upgrading...
                  </span>
                ) : (
                  "UPGRADE"
                )}
              </button>
            )}
          </div>

          {/* Target skin */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-gray-500">Target</span>
            {targetSkin ? (
              <div className="flex flex-col items-center gap-2">
                <SkinCard skin={targetSkin} selected size="lg" />
                <button
                  onClick={() => setTargetSkin(null)}
                  className="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="w-44 h-44 rounded-xl border-2 border-dashed border-[#2a3441] flex items-center justify-center text-gray-600">
                <span className="text-xs text-center px-3">Select target skin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skin Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkinSelector
          skins={skins}
          selectedSkin={betSkin}
          onSelect={setBetSkin}
          label="Your Skin"
          filterMaxPrice={targetSkin?.price}
        />
        <SkinSelector
          skins={skins}
          selectedSkin={targetSkin}
          onSelect={setTargetSkin}
          label="Target Skin"
          filterMinPrice={betSkin?.price ? betSkin.price + 0.01 : undefined}
        />
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-4">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Recent Games</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {history.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className={`flex-shrink-0 rounded-lg border p-3 min-w-[130px] ${
                  entry.won
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`text-xs font-bold ${
                      entry.won ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {entry.won ? "WIN" : "LOSE"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {entry.chance.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 truncate">
                  {entry.betSkin.weapon} | {entry.betSkin.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  → {entry.targetSkin.weapon} | {entry.targetSkin.name}
                </p>
                <p
                  className="text-xs font-bold mt-1"
                  style={{ color: RARITY_COLORS[entry.targetSkin.rarity] }}
                >
                  ${entry.targetSkin.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
