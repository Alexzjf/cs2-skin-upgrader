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
    <div className="flex flex-col gap-6">
      {/* Balance Bar */}
      <div className="flex items-center justify-between bg-[#12122a] rounded-xl border border-[#2a2a4a] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.512 1.029-.669 1.617C6.22 8.13 6.1 8.803 6.032 9.5H5a1 1 0 000 2h1.032c.068.697.188 1.37.32 1.933.157.588.384 1.142.669 1.617C7.721 16.216 8.768 17 10 17s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 14.807 10.304 15 10 15c-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.457-1.12A13.07 13.07 0 018.043 11.5H10a1 1 0 000-2H8.043c.062-.54.16-1.032.236-1.401a4.265 4.265 0 01.457-1.12z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400">Your Balance</p>
            <p className="text-xl font-bold text-white">
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setBalance((prev) => prev + 100)}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          + Add $100
        </button>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Bet Skin Selection */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-6 flex flex-col items-center min-h-[250px] justify-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Your Skin
            </p>
            {betSkin ? (
              <div className="flex flex-col items-center gap-3">
                <SkinCard skin={betSkin} selected size="lg" />
                <button
                  onClick={() => setBetSkin(null)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-sm">Select a skin to bet</p>
              </div>
            )}
          </div>

          <SkinSelector
            skins={skins}
            selectedSkin={betSkin}
            onSelect={setBetSkin}
            label="Choose Your Skin"
            filterMaxPrice={targetSkin?.price}
          />
        </div>

        {/* Center - Wheel & Upgrade Button */}
        <div className="flex flex-col items-center gap-6 lg:pt-6">
          <UpgradeWheel
            chance={chance}
            isSpinning={isSpinning}
            result={
              result ? { won: result.won, roll: result.roll } : null
            }
            onSpinComplete={handleSpinComplete}
          />

          <div className="text-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[#2a2a4a]" />
              <span className="text-sm text-gray-400">
                {chance > 0
                  ? `${chance.toFixed(2)}% chance`
                  : "Select skins"}
              </span>
              <div className="h-px flex-1 bg-[#2a2a4a]" />
            </div>

            {showResult ? (
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-xl font-bold text-lg bg-[#2a2a4a] hover:bg-[#3a3a5a] text-white transition-all"
              >
                Try Again
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={!betSkin || !targetSkin || isSpinning}
                className={`
                  px-8 py-3 rounded-xl font-bold text-lg transition-all
                  ${
                    !betSkin || !targetSkin || isSpinning
                      ? "bg-[#2a2a4a] text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-400 hover:to-yellow-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-95"
                  }
                `}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Upgrading...
                  </span>
                ) : (
                  "UPGRADE"
                )}
              </button>
            )}
          </div>

          {showResult && result && (
            <div
              className={`rounded-xl border-2 p-4 text-center w-full max-w-xs ${
                result.won
                  ? "border-green-500 bg-green-500/10"
                  : "border-red-500 bg-red-500/10"
              }`}
            >
              <p
                className={`text-2xl font-black mb-1 ${
                  result.won ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.won ? "YOU WON!" : "YOU LOST"}
              </p>
              <p className="text-xs text-gray-400">
                Roll: {result.roll.toFixed(2)} | Chance:{" "}
                {result.chance.toFixed(2)}%
              </p>
              {result.won && (
                <p className="text-sm text-green-300 mt-2 font-medium">
                  +${result.targetSkin.price.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Target Skin Selection */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-6 flex flex-col items-center min-h-[250px] justify-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Target Skin
            </p>
            {targetSkin ? (
              <div className="flex flex-col items-center gap-3">
                <SkinCard skin={targetSkin} selected size="lg" />
                <button
                  onClick={() => setTargetSkin(null)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3l14 9-14 9V3z"
                  />
                </svg>
                <p className="text-sm">Select target skin</p>
              </div>
            )}
          </div>

          <SkinSelector
            skins={skins}
            selectedSkin={targetSkin}
            onSelect={setTargetSkin}
            label="Choose Target Skin"
            filterMinPrice={betSkin?.price ? betSkin.price + 0.01 : undefined}
          />
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-4">
          <h3 className="text-lg font-bold text-white mb-3">Recent Games</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {history.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className={`flex-shrink-0 rounded-lg border p-3 min-w-[140px] ${
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
                  <span className="text-xs text-gray-500">
                    {entry.chance.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-300 truncate">
                  {entry.betSkin.weapon} | {entry.betSkin.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  &rarr; {entry.targetSkin.weapon} | {entry.targetSkin.name}
                </p>
                <p
                  className="text-xs font-bold mt-1"
                  style={{
                    color: RARITY_COLORS[entry.targetSkin.rarity],
                  }}
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
