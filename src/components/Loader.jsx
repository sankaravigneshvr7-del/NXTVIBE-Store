import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logos/logo-main.png";

const STAGES = ["Cosmetics", "Fashions", "Snacks", "RC Cars"];
const MAX_PARTICLES = 7000;

export default function Loader({ onDone }) {
  const canvasRef = useRef(null);
  const percentRef = useRef(null);
  const barRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const [lit, setLit] = useState(0);
  const [burst, setBurst] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let particles = [];
    let img = null;
    let raf = 0;
    let cancelled = false;
    let doneCalled = false;
    let phase = "gather"; // gather -> hold -> explode
    let phaseStart = 0;
    let startT = performance.now();
    let last = startT;
    let progress = 0;
    let litNow = 0;
    let resizeTimer;
    const timers = [];

    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const callDone = () => {
      if (doneCalled) return;
      doneCalled = true;
      doneRef.current?.();
    };

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // read the logo pixels and turn them into particle targets
    const build = (keep) => {
      const size = Math.min(w * 0.88, h * 0.56, 560);
      const scale = Math.min(size / img.width, size / img.height);
      const iw = Math.max(1, Math.round(img.width * scale));
      const ih = Math.max(1, Math.round(img.height * scale));
      const off = document.createElement("canvas");
      off.width = iw;
      off.height = ih;
      const octx = off.getContext("2d", { willReadFrequently: true });
      octx.drawImage(img, 0, 0, iw, ih);
      const data = octx.getImageData(0, 0, iw, ih).data;

      // corner pixel is solid = logo has a background, not transparent
      if (data[3] > 250) return false;

      const collect = (gap) => {
        const pts = [];
        for (let y = 0; y < ih; y += gap) {
          for (let x = 0; x < iw; x += gap) {
            const i = (y * iw + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (data[i + 3] > 140 && r + g + b > 150) {
              pts.push({ x, y, qr: r >> 4, qg: g >> 4, qb: b >> 4 });
            }
          }
        }
        return pts;
      };

      let gap = Math.max(2, Math.round(size / 150));
      let pts = collect(gap);
      while (pts.length > MAX_PARTICLES) {
        gap += 1;
        pts = collect(gap);
      }
      pts.sort((a, b) => (a.qr << 8 | a.qg << 4 | a.qb) - (b.qr << 8 | b.qg << 4 | b.qb));

      const ox = (w - iw) / 2;
      const oy = (h - ih) / 2 - h * 0.03;
      const old = particles;

      particles = pts.map((pt, i) => {
        const prev = keep ? old[i] : null;
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.max(w, h) * (0.6 + Math.random() * 0.5);
        return {
          x: prev ? prev.x : w / 2 + Math.cos(ang) * dist,
          y: prev ? prev.y : h / 2 + Math.sin(ang) * dist,
          vx: prev ? prev.vx : 0,
          vy: prev ? prev.vy : 0,
          tx: ox + pt.x,
          ty: oy + pt.y,
          delay: prev ? prev.delay : Math.random() * 1.3,
          s: gap * 0.55 + Math.random() * 0.7,
          tw: Math.random() * 6.28,
          life: 1,
          key: (pt.qr << 8) | (pt.qg << 4) | pt.qb,
          fill: `rgb(${pt.qr * 17},${pt.qg * 17},${pt.qb * 17})`,
        };
      });
      return true;
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      let lastKey = -1;
      for (const p of particles) {
        p.x = p.tx;
        p.y = p.ty;
        if (p.key !== lastKey) {
          ctx.fillStyle = p.fill;
          lastKey = p.key;
        }
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    };

    const startExplode = () => {
      for (const p of particles) {
        const ang = Math.atan2(p.y - h / 2, p.x - w / 2) + (Math.random() - 0.5) * 0.8;
        const sp = 3 + Math.random() * 14;
        p.vx = Math.cos(ang) * sp;
        p.vy = Math.sin(ang) * sp;
        p.life = 0.6 + Math.random() * 0.6;
      }
      setBurst(true);
      later(callDone, 550);
    };

    const frame = (now) => {
      if (cancelled) return;
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;
      const t = (now - startT) / 1000;
      const n = particles.length;
      const m = mouseRef.current;
      const damp = Math.pow(0.9, dt);
      const exploding = phase === "explode";
      let settled = 0;
      let lastKey = -1;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < n; i++) {
        const p = particles[i];

        if (exploding) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= 0.017 * dt;
          if (p.life <= 0) continue;
        } else if (t >= p.delay) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          if (Math.abs(dx) + Math.abs(dy) < 3) settled++;

          p.vx = (p.vx + dx * 0.02 * dt) * damp;
          p.vy = (p.vy + dy * 0.02 * dt) * damp;

          // finger / mouse pushes the dust away
          const mx = p.x - m.x;
          const my = p.y - m.y;
          const d2 = mx * mx + my * my;
          if (d2 < 6400 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / 80) * 3.2 * dt;
            p.vx += (mx / d) * f;
            p.vy += (my / d) * f;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (p.key !== lastKey) {
          ctx.fillStyle = p.fill;
          lastKey = p.key;
        }
        ctx.globalAlpha = exploding
          ? Math.max(p.life, 0)
          : 0.8 + 0.2 * Math.sin(t * 3 + p.tw);
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;

      if (phase === "gather" && n > 0) {
        const target = (settled / n) * 100;
        if (target > progress) progress += (target - progress) * 0.12;
        if (progress >= 96 || t > 7) {
          progress = 100;
          phase = "hold";
          phaseStart = now;
        }
      } else if (phase === "hold" && now - phaseStart > 700) {
        phase = "explode";
        phaseStart = now;
        startExplode();
      }

      if (percentRef.current) percentRef.current.textContent = Math.round(progress) + "%";
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress / 100})`;
      const litNew = Math.floor(progress / 25);
      if (litNew !== litNow) {
        litNow = litNew;
        setLit(litNew);
      }

      if (exploding && now - phaseStart > 1500) {
        callDone();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const runFallback = () => {
      setFallback(true);
      for (let i = 1; i <= 4; i++) {
        later(() => {
          setLit(i);
          if (percentRef.current) percentRef.current.textContent = i * 25 + "%";
          if (barRef.current) barRef.current.style.transform = `scaleX(${i / 4})`;
        }, i * 500);
      }
      later(callDone, 2600);
    };

    setSize();

    const loadImg = new Image();
    loadImg.onload = () => {
      if (cancelled) return;
      img = loadImg;
      if (!build(false)) {
        runFallback();
        return;
      }
      if (reduce) {
        drawStatic();
        setLit(4);
        if (percentRef.current) percentRef.current.textContent = "100%";
        if (barRef.current) barRef.current.style.transform = "scaleX(1)";
        later(callDone, 1400);
      } else {
        startT = performance.now();
        last = startT;
        raf = requestAnimationFrame(frame);
      }
    };
    loadImg.onerror = () => {
      if (!cancelled) runFallback();
    };
    loadImg.src = logo;

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSize();
        if (img && phase !== "explode") {
          build(true);
          if (reduce) drawStatic();
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const move = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const leave = () => {
    mouseRef.current = { x: -9999, y: -9999 };
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] select-none overflow-hidden bg-[#0b0906] touch-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onPointerMove={move}
      onPointerDown={move}
      onPointerUp={leave}
      onPointerLeave={leave}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2a2113_0%,#0b0906_72%)]" />

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* only used if the logo PNG is not transparent */}
      {fallback && (
        <motion.img
          src={logo}
          alt="Nxt Vibe"
          className="absolute left-1/2 top-[46%] w-[min(78vw,420px)] -translate-x-1/2 -translate-y-1/2 object-contain"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        />
      )}

      {/* gold flash when the logo bursts */}
      {burst && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,240,200,0.95)_0%,rgba(201,169,97,0.5)_35%,transparent_70%)]"
          initial={{ opacity: 0.9, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}

      {/* bottom info */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] transition-opacity duration-500 ${
          burst ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-display text-[10px] uppercase tracking-[0.25em] sm:gap-x-7 sm:text-xs">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={`transition-all duration-700 ${
                i < lit ? "text-gold [text-shadow:0_0_12px_rgba(201,169,97,0.8)]" : "text-white/25"
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="h-[2px] w-[min(70vw,320px)] overflow-hidden rounded-full bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <p ref={percentRef} className="font-display text-xs tracking-[0.4em] text-gold/80">
          0%
        </p>
        <p className="text-[10px] tracking-widest text-white/30">
          ✦ touch the gold dust ✦
        </p>
      </div>
    </motion.div>
  );
}