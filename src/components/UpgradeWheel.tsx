"use client";

import { useEffect, useRef, useCallback } from "react";

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result: { won: boolean; roll: number } | null;
  onSpinComplete?: () => void;
}

const SIZE = 320;
const SPIN_DURATION = 3500;
const FULL_SPINS = 5;

// Arc spans 270 degrees (from 135° to 405° i.e. bottom-left to bottom-right going clockwise over top)
const ARC_START = (135 * Math.PI) / 180;
const ARC_END = (405 * Math.PI) / 180;
const ARC_SPAN = ARC_END - ARC_START;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// Interpolate color from red → orange → green based on percentage
function getArcColor(percent: number): string {
  if (percent <= 50) {
    // Red to orange
    const t = percent / 50;
    const r = 220;
    const g = Math.round(60 + t * 120);
    const b = 20;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Orange to green
    const t = (percent - 50) / 50;
    const r = Math.round(220 - t * 180);
    const g = Math.round(180 + t * 60);
    const b = Math.round(20 + t * 20);
    return `rgb(${r}, ${g}, ${b})`;
  }
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

  const stableOnSpinComplete = useCallback(() => {
    onSpinComplete?.();
  }, [onSpinComplete]);

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
      const outerR = SIZE / 2 - 20;
      const ringWidth = 18;
      const innerR = outerR - ringWidth;
      const tickR = outerR + 8;

      // Background circle (dark)
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = "#0f1419";
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Track (unfilled arc) - dark gray
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - ringWidth / 2, ARC_START, ARC_END);
      ctx.strokeStyle = "#1a2332";
      ctx.lineWidth = ringWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Filled arc (based on chance %) with gradient color
      const fillEnd = ARC_START + (chance / 100) * ARC_SPAN;
      if (chance > 0) {
        ctx.lineCap = "round";
        ctx.lineWidth = ringWidth;
        const segments = 60;
        const segmentAngle = (fillEnd - ARC_START) / segments;
        for (let i = 0; i < segments; i++) {
          const segStart = ARC_START + i * segmentAngle;
          const segEnd = segStart + segmentAngle + 0.01;
          const pct = (i / segments) * chance;
          ctx.beginPath();
          ctx.arc(cx, cy, outerR - ringWidth / 2, segStart, segEnd);
          ctx.strokeStyle = getArcColor(pct);
          ctx.stroke();
        }

        // Glow effect
        ctx.save();
        ctx.shadowColor = getArcColor(chance);
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR - ringWidth / 2, fillEnd - 0.1, fillEnd);
        ctx.strokeStyle = getArcColor(chance);
        ctx.lineWidth = ringWidth;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      // Tick marks
      ctx.lineWidth = 2;
      const numTicks = 36;
      for (let i = 0; i <= numTicks; i++) {
        const angle = ARC_START + (i / numTicks) * ARC_SPAN;
        const isMajor = i % 9 === 0;
        const tickLen = isMajor ? 10 : 5;
        const x1 = cx + Math.cos(angle) * (tickR - tickLen);
        const y1 = cy + Math.sin(angle) * (tickR - tickLen);
        const x2 = cx + Math.cos(angle) * tickR;
        const y2 = cy + Math.sin(angle) * tickR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i / numTicks <= chance / 100 ? getArcColor((i / numTicks) * 100) : "#374151";
        ctx.lineWidth = isMajor ? 2.5 : 1.5;
        ctx.stroke();
      }

      // Labels (100% top, 50% sides)
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // 100% at top
      ctx.fillText("100%", cx, cy - outerR - 16);
      // 0% at start, 50% at midpoint
      ctx.fillText("0%", cx + Math.cos(ARC_START) * (outerR + 20), cy + Math.sin(ARC_START) * (outerR + 20));
      ctx.fillText("50%", cx + Math.cos(ARC_START + ARC_SPAN * 0.5) * (outerR + 20), cy + Math.sin(ARC_START + ARC_SPAN * 0.5) * (outerR + 20));

      // Center circle (darker)
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 8, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0f14";
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chance text in center
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${chance.toFixed(2)}%`, cx, cy - 6);

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText("ШАНС", cx, cy + 22);

      // Pointer/needle
      const needleAngle = ARC_START + pointerAngle * ARC_SPAN;
      const needleOuterR = outerR + 2;
      const pointerSize = 10;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle);

      // Triangle pointer pointing inward
      ctx.beginPath();
      ctx.moveTo(needleOuterR + pointerSize, 0);
      ctx.lineTo(needleOuterR, -5);
      ctx.lineTo(needleOuterR, 5);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
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

    // The pointer will land at: roll/100 of the arc
    // Add full rotations for visual effect
    const landingPosition = result.roll / 100;
    targetAngleRef.current = FULL_SPINS + landingPosition;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutQuart(progress);
      const currentPos = targetAngleRef.current * eased;
      // Normalize to 0-1 range for drawing (just use fractional part)
      const drawPos = currentPos % 1;

      draw(drawPos);

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
      />
    </div>
  );
}
