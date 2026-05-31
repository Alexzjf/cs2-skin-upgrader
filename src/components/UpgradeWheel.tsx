"use client";

import { useEffect, useRef, useCallback } from "react";

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result: { won: boolean; roll: number } | null;
  onSpinComplete?: () => void;
}

const SIZE = 280;
const SPIN_DURATION = 3500;
const FULL_SPINS = 5;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function UpgradeWheel({
  chance,
  isSpinning,
  result,
  onSpinComplete,
}: UpgradeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const spinCompleteCalledRef = useRef(false);
  const startTimeRef = useRef(0);
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);

  const stableOnSpinComplete = useCallback(() => {
    onSpinComplete?.();
  }, [onSpinComplete]);

  // Draw the gauge
  const draw = useCallback(
    (pointerAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const outerR = SIZE / 2 - 16;
      const innerR = outerR - 32;
      const chanceRad = (chance / 100) * Math.PI * 2;

      // Win zone (green) - starts from top (-PI/2)
      const startAngle = -Math.PI / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + chanceRad);
      ctx.arc(cx, cy, innerR, startAngle + chanceRad, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = "#16a34a";
      ctx.fill();

      // Lose zone (red)
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle + chanceRad, startAngle + Math.PI * 2);
      ctx.arc(cx, cy, innerR, startAngle + Math.PI * 2, startAngle + chanceRad, true);
      ctx.closePath();
      ctx.fillStyle = "#dc2626";
      ctx.fill();

      // Zone border lines
      ctx.strokeStyle = "#0b0f19";
      ctx.lineWidth = 2;
      // Border at 0 (top)
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(startAngle) * innerR, cy + Math.sin(startAngle) * innerR);
      ctx.lineTo(cx + Math.cos(startAngle) * outerR, cy + Math.sin(startAngle) * outerR);
      ctx.stroke();
      // Border at chance angle
      const borderAngle = startAngle + chanceRad;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(borderAngle) * innerR, cy + Math.sin(borderAngle) * innerR);
      ctx.lineTo(cx + Math.cos(borderAngle) * outerR, cy + Math.sin(borderAngle) * outerR);
      ctx.stroke();

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center circle (dark)
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
      ctx.fillStyle = "#111827";
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Chance text in center
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${chance.toFixed(1)}%`, cx, cy - 8);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText("CHANCE", cx, cy + 16);

      // Pointer/needle
      const needleAngle = startAngle + pointerAngle;
      const needleLength = outerR + 8;
      const needleBase = 20;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle + Math.PI / 2);

      // Needle shape
      ctx.beginPath();
      ctx.moveTo(0, -needleLength + 10);
      ctx.lineTo(-5, -needleBase);
      ctx.lineTo(-2, 0);
      ctx.lineTo(2, 0);
      ctx.lineTo(5, -needleBase);
      ctx.closePath();
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Needle center dot
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    },
    [chance]
  );

  // Initial draw
  useEffect(() => {
    draw(0);
  }, [draw]);

  // Spin animation
  useEffect(() => {
    if (!isSpinning || !result) return;

    spinCompleteCalledRef.current = false;
    startTimeRef.current = performance.now();

    // Target: roll determines where the pointer lands
    // roll is 0-100. If roll < chance → win (lands in green zone)
    // Green zone is from angle 0 to chanceRad
    const rollAngle = (result.roll / 100) * Math.PI * 2;
    const totalRotation = FULL_SPINS * Math.PI * 2 + rollAngle;
    targetAngleRef.current = totalRotation;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutQuart(progress);
      const currentAngle = targetAngleRef.current * eased;
      currentAngleRef.current = currentAngle;

      draw(currentAngle);

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
  }, [isSpinning, result, draw, stableOnSpinComplete]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: SIZE, height: SIZE }}
        className="drop-shadow-lg"
      />
    </div>
  );
}
