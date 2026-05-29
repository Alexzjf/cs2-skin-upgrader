"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result: { won: boolean; roll: number } | null;
  onSpinComplete?: () => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function drawWheel(
  canvas: HTMLCanvasElement,
  chancePercent: number,
  rollPosition: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 20;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(center, center, radius + 5, 0, Math.PI * 2);
  ctx.strokeStyle = "#2a2a4a";
  ctx.lineWidth = 3;
  ctx.stroke();

  const winAngle = (chancePercent / 100) * Math.PI * 2;
  const offsetAngle = -Math.PI / 2;

  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(
    center,
    center,
    radius,
    offsetAngle + winAngle,
    offsetAngle + Math.PI * 2
  );
  ctx.closePath();
  const loseGrad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    radius
  );
  loseGrad.addColorStop(0, "#3d1111");
  loseGrad.addColorStop(1, "#1a0505");
  ctx.fillStyle = loseGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, radius, offsetAngle, offsetAngle + winAngle);
  ctx.closePath();
  const winGrad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    radius
  );
  winGrad.addColorStop(0, "#114411");
  winGrad.addColorStop(1, "#052205");
  ctx.fillStyle = winGrad;
  ctx.fill();

  const rollAngle = offsetAngle + (rollPosition / 100) * Math.PI * 2;
  const pointerLen = radius - 10;

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rollAngle);

  ctx.beginPath();
  ctx.moveTo(0, -pointerLen);
  ctx.lineTo(-6, -pointerLen + 20);
  ctx.lineTo(6, -pointerLen + 20);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -pointerLen + 15);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(center, center, 35, 0, Math.PI * 2);
  const centerGrad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    35
  );
  centerGrad.addColorStop(0, "#2a2a4a");
  centerGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = centerGrad;
  ctx.fill();
  ctx.strokeStyle = "#3a3a5a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${chancePercent.toFixed(1)}%`, center, center);
}

export default function UpgradeWheel({
  chance,
  isSpinning,
  result,
  onSpinComplete,
}: UpgradeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayedRoll, setDisplayedRoll] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      drawWheel(canvas, chance, displayedRoll);
    }
  }, [chance, displayedRoll]);

  const stableOnSpinComplete = useCallback(() => {
    onSpinComplete?.();
  }, [onSpinComplete]);

  useEffect(() => {
    if (isSpinning && result) {
      startTimeRef.current = Date.now();
      const duration = 3000;
      const targetRoll = result.roll;

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        const fullSpins = 3;
        const totalAngle = fullSpins * 100 + targetRoll;
        const currentRoll = (totalAngle * eased) % 100;

        setDisplayedRoll(currentRoll);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayedRoll(targetRoll);
          stableOnSpinComplete();
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isSpinning, result, stableOnSpinComplete]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="drop-shadow-2xl"
      />
      {result && !isSpinning && (
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full ${
            result.won
              ? "bg-green-500/10 ring-4 ring-green-500/30"
              : "bg-red-500/10 ring-4 ring-red-500/30"
          }`}
        >
          <span
            className={`text-3xl font-black ${
              result.won ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.won ? "WIN!" : "LOSE"}
          </span>
        </div>
      )}
    </div>
  );
}
