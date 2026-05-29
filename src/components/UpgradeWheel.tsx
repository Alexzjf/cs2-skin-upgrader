"use client";

import { useEffect, useRef, useCallback } from "react";

interface UpgradeWheelProps {
  chance: number;
  isSpinning: boolean;
  result: { won: boolean; roll: number } | null;
  onSpinComplete?: () => void;
}

const NUM_SEGMENTS = 120;
const SPIN_DURATION = 4500;
const FULL_SPINS = 6;
const DISPLAY_SIZE = 320;

function spinEasing(t: number): number {
  if (t < 0.6) {
    return (1 - Math.pow(1 - t / 0.6, 2)) * 0.8;
  }
  const local = (t - 0.6) / 0.4;
  const c1 = 1.1;
  const c3 = c1 + 1;
  const back = 1 + c3 * Math.pow(local - 1, 3) + c1 * Math.pow(local - 1, 2);
  return 0.8 + back * 0.2;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  chancePercent: number,
  rotation: number,
  time: number,
  spinning: boolean,
  particles: Particle[]
) {
  const size = DISPLAY_SIZE;
  const center = size / 2;
  const outerRadius = size / 2 - 18;
  const innerRadius = outerRadius - 38;
  const hubRadius = 42;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  // Outer glow ring
  const glowPulse = spinning ? 0.5 + Math.sin(time * 0.004) * 0.3 : 0.25;
  ctx.beginPath();
  ctx.arc(center, center, outerRadius + 6, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(139, 92, 246, ${glowPulse})`;
  ctx.lineWidth = 6;
  ctx.shadowBlur = 25;
  ctx.shadowColor = `rgba(139, 92, 246, ${glowPulse * 0.8})`;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Outer decorative ring
  ctx.beginPath();
  ctx.arc(center, center, outerRadius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(60, 50, 90, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // === Rotate wheel ===
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-center, -center);

  // Draw segments
  const winSegs = Math.max(1, Math.round((chancePercent / 100) * NUM_SEGMENTS));
  const segAngle = (Math.PI * 2) / NUM_SEGMENTS;
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    const a = startAngle + i * segAngle;
    const isWin = i < winSegs;
    const alt = i % 2 === 0 ? 1.0 : 0.82;

    ctx.beginPath();
    ctx.moveTo(
      center + Math.cos(a) * innerRadius,
      center + Math.sin(a) * innerRadius
    );
    ctx.arc(center, center, outerRadius, a, a + segAngle);
    ctx.arc(center, center, innerRadius, a + segAngle, a, true);
    ctx.closePath();

    if (isWin) {
      const g = ctx.createRadialGradient(
        center, center, innerRadius, center, center, outerRadius
      );
      g.addColorStop(0, `rgba(22, ${Math.floor(163 * alt)}, 74, 0.95)`);
      g.addColorStop(1, `rgba(16, ${Math.floor(130 * alt)}, 55, 1)`);
      ctx.fillStyle = g;
    } else {
      const g = ctx.createRadialGradient(
        center, center, innerRadius, center, center, outerRadius
      );
      g.addColorStop(0, `rgba(${Math.floor(200 * alt)}, 30, 30, 0.9)`);
      g.addColorStop(1, `rgba(${Math.floor(160 * alt)}, 20, 20, 0.95)`);
      ctx.fillStyle = g;
    }
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Zone boundary lines (golden)
  if (chancePercent > 0 && chancePercent < 100) {
    for (const frac of [0, chancePercent / 100]) {
      const bAngle = startAngle + frac * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        center + Math.cos(bAngle) * (innerRadius - 4),
        center + Math.sin(bAngle) * (innerRadius - 4)
      );
      ctx.lineTo(
        center + Math.cos(bAngle) * (outerRadius + 4),
        center + Math.sin(bAngle) * (outerRadius + 4)
      );
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(251, 191, 36, 0.7)";
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Tick marks
  for (let i = 0; i < 72; i++) {
    const a = startAngle + (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const ts = outerRadius - (long ? 7 : 3);
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(a) * ts, center + Math.sin(a) * ts);
    ctx.lineTo(center + Math.cos(a) * outerRadius, center + Math.sin(a) * outerRadius);
    ctx.strokeStyle = long ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = long ? 1.5 : 0.8;
    ctx.stroke();
  }

  // Inner decorative ring
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(80, 70, 120, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore(); // end wheel rotation

  // === Fixed pointer at top ===
  const py = center - outerRadius + 4;
  ctx.save();
  ctx.translate(center, py);

  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(251, 191, 36, 0.9)";

  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(-11, -8);
  ctx.lineTo(11, -8);
  ctx.closePath();

  const pg = ctx.createLinearGradient(0, -8, 0, 16);
  pg.addColorStop(0, "#fde68a");
  pg.addColorStop(1, "#f59e0b");
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();

  // === Center hub ===
  const hg = ctx.createRadialGradient(center, center, 0, center, center, hubRadius);
  hg.addColorStop(0, "rgba(45, 35, 75, 1)");
  hg.addColorStop(0.7, "rgba(30, 25, 55, 1)");
  hg.addColorStop(1, "rgba(22, 18, 42, 1)");

  ctx.beginPath();
  ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
  ctx.fillStyle = hg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
  const hubPulse = spinning ? 0.7 + Math.sin(time * 0.003) * 0.3 : 0.4;
  ctx.strokeStyle = `rgba(139, 92, 246, ${hubPulse})`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = spinning ? 15 : 8;
  ctx.shadowColor = `rgba(139, 92, 246, ${hubPulse * 0.6})`;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner decorative circle
  ctx.beginPath();
  ctx.arc(center, center, hubRadius - 6, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chance text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 6;
  ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
  ctx.fillText(`${chancePercent.toFixed(1)}%`, center, center);
  ctx.shadowBlur = 0;

  // === Particles ===
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
    ctx.fill();
  }

  ctx.restore();
}

export default function UpgradeWheel({
  chance,
  isSpinning,
  result,
  onSpinComplete,
}: UpgradeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const spinStartRef = useRef(0);
  const spinTargetRef = useRef(0);
  const spinningRef = useRef(false);
  const resultRef = useRef<{ won: boolean; roll: number } | null>(null);
  const dprRef = useRef(1);
  const spinCompleteCalledRef = useRef(false);

  const stableOnSpinComplete = useCallback(() => {
    onSpinComplete?.();
  }, [onSpinComplete]);

  // Continuous render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    dprRef.current = window.devicePixelRatio || 1;
    canvas.width = DISPLAY_SIZE * dprRef.current;
    canvas.height = DISPLAY_SIZE * dprRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const loop = () => {
      const now = Date.now();

      // Update spin
      if (spinningRef.current && resultRef.current) {
        const elapsed = now - spinStartRef.current;
        const progress = Math.min(elapsed / SPIN_DURATION, 1);
        rotationRef.current = spinTargetRef.current * spinEasing(progress);

        if (progress >= 1) {
          rotationRef.current = spinTargetRef.current;
          spinningRef.current = false;

          // Burst particles
          const hue = resultRef.current.won ? 140 : 0;
          const cx = DISPLAY_SIZE / 2;
          for (let i = 0; i < 40; i++) {
            const a = (Math.PI * 2 * i) / 40;
            const speed = 2.5 + Math.random() * 4;
            particlesRef.current.push({
              x: cx,
              y: cx,
              vx: Math.cos(a) * speed,
              vy: Math.sin(a) * speed,
              life: 35 + Math.random() * 30,
              maxLife: 65,
              hue: hue + Math.random() * 30 - 15,
              size: 2.5 + Math.random() * 3.5,
            });
          }

          if (!spinCompleteCalledRef.current) {
            spinCompleteCalledRef.current = true;
            stableOnSpinComplete();
          }
        }

        // Spawn trail particles during spin
        if (spinningRef.current && Math.random() > 0.6) {
          const a = Math.random() * Math.PI * 2;
          const r = 110 + Math.random() * 30;
          const cx = DISPLAY_SIZE / 2;
          particlesRef.current.push({
            x: cx + Math.cos(a) * r,
            y: cx + Math.sin(a) * r,
            vx: Math.cos(a) * (0.5 + Math.random()),
            vy: Math.sin(a) * (0.5 + Math.random()),
            life: 20 + Math.random() * 15,
            maxLife: 35,
            hue: 270 + Math.random() * 40,
            size: 1.5 + Math.random() * 2,
          });
        }
      }

      // Update particles
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.05,
          vx: p.vx * 0.99,
          life: p.life - 1,
        }))
        .filter((p) => p.life > 0);

      drawWheel(
        ctx,
        dprRef.current,
        chance,
        rotationRef.current,
        now,
        spinningRef.current,
        particlesRef.current
      );

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [chance, stableOnSpinComplete]);

  // Start spin when props change
  useEffect(() => {
    if (isSpinning && result) {
      spinStartRef.current = Date.now();
      spinTargetRef.current = -(FULL_SPINS * 360 + (result.roll / 100) * 360);
      spinningRef.current = true;
      resultRef.current = result;
      spinCompleteCalledRef.current = false;
      particlesRef.current = [];
    }
  }, [isSpinning, result]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="drop-shadow-2xl"
          style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
        />
        {isSpinning && (
          <div
            className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
            style={{ boxShadow: "0 0 60px rgba(139, 92, 246, 0.25)" }}
          />
        )}
      </div>
      {result && !isSpinning && (
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full animate-slide-up ${
            result.won
              ? "bg-green-500/10 ring-4 ring-green-500/40"
              : "bg-red-500/10 ring-4 ring-red-500/40"
          }`}
          style={{
            boxShadow: result.won
              ? "0 0 80px rgba(34, 197, 94, 0.35)"
              : "0 0 80px rgba(239, 68, 68, 0.35)",
          }}
        >
          <span
            className={`text-4xl font-black drop-shadow-lg ${
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
