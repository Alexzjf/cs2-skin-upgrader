"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result: { won: boolean; roll: number } | null;
  onSpinComplete?: () => void;
}

const SEGMENT_WIDTH = 48;
const SEGMENT_HEIGHT = 80;
const TOTAL_SEGMENTS = 120;
const SPIN_DURATION = 4000;
const STRIP_WIDTH = TOTAL_SEGMENTS * SEGMENT_WIDTH;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function generateSegments(chancePercent: number, seed: number): boolean[] {
  const segments: boolean[] = [];
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const pos = (i / TOTAL_SEGMENTS) * 100;
    segments.push(pos < chancePercent);
  }
  let s = seed;
  for (let i = segments.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [segments[i], segments[j]] = [segments[j], segments[i]];
  }
  return segments;
}

export default function UpgradeWheel({
  chance,
  isSpinning,
  result,
  onSpinComplete,
}: UpgradeWheelProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const spinCompleteCalledRef = useRef(false);
  const startTimeRef = useRef(0);
  const targetOffsetRef = useRef(0);

  const stableOnSpinComplete = useCallback(() => {
    onSpinComplete?.();
  }, [onSpinComplete]);

  const segments = useMemo(() => {
    const seed = Math.floor(chance * 1000) + (result ? (result.won ? 7 : 13) : 0);
    const segs = generateSegments(chance, seed);
    if (isSpinning && result) {
      const centerIndex = Math.floor(TOTAL_SEGMENTS / 2);
      segs[centerIndex] = result.won;
      if (centerIndex > 0) segs[centerIndex - 1] = !result.won;
      if (centerIndex < TOTAL_SEGMENTS - 1) segs[centerIndex + 1] = !result.won;
    }
    return segs;
  }, [chance, isSpinning, result]);

  // Drive animation via DOM ref
  useEffect(() => {
    if (!isSpinning || !result) {
      // Reset position when idle
      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(calc(50% - ${SEGMENT_WIDTH / 2}px))`;
      }
      return;
    }

    spinCompleteCalledRef.current = false;

    const baseScroll = STRIP_WIDTH * 0.6;
    const extraScroll = Math.random() * STRIP_WIDTH * 0.2;
    targetOffsetRef.current = baseScroll + extraScroll;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutCubic(progress);
      const currentOffset = targetOffsetRef.current * eased;

      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(calc(50% - ${SEGMENT_WIDTH / 2}px - ${currentOffset}px))`;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (!spinCompleteCalledRef.current) {
          spinCompleteCalledRef.current = true;
          stableOnSpinComplete();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpinning, result, stableOnSpinComplete]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Roulette container */}
      <div className="relative w-full max-w-[720px]">
        {/* Pointer (top center) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
        </div>

        {/* Bottom pointer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
        </div>

        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-[1px] w-[2px] bg-yellow-400/80 z-10 pointer-events-none" />

        {/* Track */}
        <div
          className="overflow-hidden rounded-xl border-2 border-[#1f2937] bg-[#0a0e17] relative"
          style={{ height: SEGMENT_HEIGHT + 8 }}
        >
          {/* Gradient edges */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0e17] to-transparent z-10 pointer-events-none rounded-l-xl" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0e17] to-transparent z-10 pointer-events-none rounded-r-xl" />

          {/* Sliding strip */}
          <div
            ref={stripRef}
            className="flex items-center h-full will-change-transform"
            style={{
              transform: `translateX(calc(50% - ${SEGMENT_WIDTH / 2}px))`,
              width: STRIP_WIDTH,
            }}
          >
            {segments.map((isWin, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-center border-r border-[#0f1520]"
                style={{
                  width: SEGMENT_WIDTH,
                  height: SEGMENT_HEIGHT,
                  background: isWin
                    ? "linear-gradient(180deg, #166534 0%, #14532d 100%)"
                    : "linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%)",
                }}
              >
                <span
                  className={`text-xs font-bold opacity-50 ${
                    isWin ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {isWin ? "W" : "L"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chance legend */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <span className="text-[11px] text-gray-500">WIN</span>
        </div>
        <span className="text-base font-bold text-white">
          {chance > 0 ? `${chance.toFixed(2)}%` : "—"}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-800" />
          <span className="text-[11px] text-gray-500">LOSE</span>
        </div>
      </div>
    </div>
  );
}
