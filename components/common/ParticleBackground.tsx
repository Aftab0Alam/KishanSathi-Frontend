"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number; color: string; baseAlpha: number;
}

const COLORS = ["#4ADE80", "#22D3EE", "#8B5CF6", "#FBBF24"];
const PARTICLE_COUNT = 60;
const CONNECTION_DIST = 120;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseAlpha = Math.random() * 0.4 + 0.15;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.5 + 0.8,
        alpha: baseAlpha,
        baseAlpha,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onMouseLeave = () => { mouseX = -1000; mouseY = -1000; };

    let animId: number;
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.005;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Mouse interaction — subtle attraction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.015;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
          p.alpha = Math.min(p.baseAlpha + (200 - dist) / 200 * 0.3, 1);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.02;
        }

        // Dampen velocity
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Gentle pulse
        const pulse = Math.sin(time * 2 + i * 0.5) * 0.15 + 1;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        // Core particle (no shadow for performance)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < CONNECTION_DIST) {
            const lineAlpha = (1 - d / CONNECTION_DIST) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(74, 222, 128, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{
        position: "fixed", top: 0, left: 0,
        pointerEvents: "none", zIndex: 0, opacity: 0.55,
      }}
    />
  );
}
