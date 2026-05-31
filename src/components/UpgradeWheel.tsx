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

// Arc spans 270° total. Gap at the bottom (90° centered).
// Left half: from 225° (lower-left) going counterclockwise to 90° (top in canvas = 270° standard)
// In canvas: 0=right, PI/2=down, PI=left, 3PI/2=up (but we use clockwise)
// Arc from 135° to 45° (going clockwise over the top) = 270°
const ARC_GAP_HALF = (45 * Math.PI) / 180; // 45° gap on each side of bottom
const BOTTOM = Math.PI / 2; // 90° = bottom in canvas coords
const ARC_LEFT_START = BOTTOM + ARC_GAP_HALF; // 135° - left end of arc

const HALF_ARC = Math.PI * 0.75; // 135° each half (from bottom-side to top)

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// Color from red (0%) → orange (50%) → green (100%)
function getArcColor(percent: number): string {
  if (percent <= 50) {
    const t = percent / 50;
    const r = 220;
    const g = Math.round(50 + t * 140);
    const b = 20;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (percent - 50) / 50;
    const r = Math.round(220 - t * 180);
    const g = Math.round(190 + t * 50);
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
      const outerR = SIZE / 2 - 24;
      const ringWidth = 20;
      const midR = outerR - ringWidth / 2;
      const innerR = outerR - ringWidth;
      const tickR = outerR + 4;

      // Background dark circle
      ctx.beginPath();
      ctx.arc(cx, cy, outerR + 12, 0, Math.PI * 2);
      ctx.fillStyle = "#0f1419";
      ctx.fill();

      // Outer ring border
      ctx.beginPath();
      ctx.arc(cx, cy, outerR + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Track (unfilled arc background) - full 270° arc
      ctx.beginPath();
      ctx.arc(cx, cy, midR, ARC_LEFT_START, ARC_LEFT_START + Math.PI * 1.5, false);
      ctx.strokeStyle = "#1a2332";
      ctx.lineWidth = ringWidth;
      ctx.lineCap = "butt";
      ctx.stroke();

      // Filled arc: fills from both ends (bottom) toward the top symmetrically
      if (chance > 0) {
        const fillAmount = (chance / 100) * HALF_ARC;
        const segments = 40;

        // Left side fill
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const segFill = fillAmount / segments;
          const segStart = ARC_LEFT_START + t * fillAmount;
          const segEnd = segStart + segFill + 0.01;
          const pct = t * chance;

          ctx.beginPath();
          ctx.arc(cx, cy, midR, segStart, segEnd);
          ctx.strokeStyle = getArcColor(pct);
          ctx.lineWidth = ringWidth;
          ctx.lineCap = "butt";
          ctx.stroke();
        }

        // Right side fill (mirror)
        const rightStart = BOTTOM - ARC_GAP_HALF;
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const segFill = fillAmount / segments;
          const segEnd = rightStart - t * fillAmount;
          const segStart = segEnd - segFill - 0.01;
          const pct = t * chance;

          ctx.beginPath();
          ctx.arc(cx, cy, midR, segStart, segEnd);
          ctx.strokeStyle = getArcColor(pct);
          ctx.lineWidth = ringWidth;
          ctx.lineCap = "butt";
          ctx.stroke();
        }

        // Glow at the tips
        ctx.save();
        ctx.shadowColor = getArcColor(chance);
        ctx.shadowBlur = 12;
        const leftTip = ARC_LEFT_START + fillAmount;
        ctx.beginPath();
        ctx.arc(cx, cy, midR, leftTip - 0.05, leftTip);
        ctx.strokeStyle = getArcColor(chance);
        ctx.lineWidth = ringWidth;
        ctx.lineCap = "round";
        ctx.stroke();

        const rightTip = rightStart - fillAmount;
        ctx.beginPath();
        ctx.arc(cx, cy, midR, rightTip, rightTip + 0.05);
        ctx.strokeStyle = getArcColor(chance);
        ctx.lineWidth = ringWidth;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      // Tick marks around outer edge
      const numTicks = 40;
      for (let i = 0; i <= numTicks; i++) {
        // Ticks along the 270° arc from ARC_LEFT_START clockwise
        const angle = ARC_LEFT_START + (i / numTicks) * (Math.PI * 1.5);
        const isMajor = i % 10 === 0;
        const tickLen = isMajor ? 8 : 4;
        const x1 = cx + Math.cos(angle) * (tickR);
        const y1 = cy + Math.sin(angle) * (tickR);
        const x2 = cx + Math.cos(angle) * (tickR + tickLen);
        const y2 = cy + Math.sin(angle) * (tickR + tickLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
      }

      // Inner circle (dark center)
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 10, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0e14";
      ctx.fill();
      ctx.strokeStyle = "#1a2332";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Percentage text
      ctx.fillStyle = "#a3e635";
      ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${chance.toFixed(2)}%`, cx, cy - 6);

      ctx.fillStyle = "#6b7280";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText("ШАНС", cx, cy + 22);

      // Labels: 100% at top, 50% on sides
      ctx.fillStyle = "#4b5563";
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText("100%", cx, cy - outerR - 18);

      // 50% labels at 9 o'clock and 3 o'clock positions (midpoint of each half)
      const leftMid = ARC_LEFT_START + HALF_ARC * 0.5;
      const rightMid = (BOTTOM - ARC_GAP_HALF) - HALF_ARC * 0.5;
      ctx.fillText("50%", cx + Math.cos(leftMid) * (outerR + 22), cy + Math.sin(leftMid) * (outerR + 22));
      ctx.fillText("50%", cx + Math.cos(rightMid) * (outerR + 22), cy + Math.sin(rightMid) * (outerR + 22));

      // Pointer at bottom center
      const needlePosAngle = BOTTOM + pointerAngle;
      const pointerR = outerR + 14;

      ctx.save();
      ctx.translate(cx + Math.cos(needlePosAngle) * (midR + ringWidth * 0.5), cy + Math.sin(needlePosAngle) * (midR + ringWidth * 0.5));
      ctx.rotate(needlePosAngle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-5, 6);
      ctx.lineTo(5, 6);
      ctx.closePath();
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Small center needle dot
      ctx.beginPath();
      ctx.arc(cx + Math.cos(BOTTOM) * (pointerR - 8), cy + Math.sin(BOTTOM) * (pointerR - 8), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
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

    // Pointer spins around then lands. The result determines win/lose but
    // visually the pointer just does rotations for excitement
    const totalRotation = FULL_SPINS * Math.PI * 2 + (result.roll / 100) * Math.PI * 2;
    targetAngleRef.current = totalRotation;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutQuart(progress);
      const currentAngle = targetAngleRef.current * eased;

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
      />
    </div>
  );
}
