import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import logoMain from "../assets/logos/logo-main.png";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { whatsappLink } from "../lib/whatsapp";

/* ---------- EDIT THESE TEXTS ANYTIME ---------- */

const PROMISES = [
  { icon: "🌿", title: "Nature inspired", text: "Gentle, earthy ideas from nature in every product." },
  { icon: "🤲", title: "Handmade with care", text: "Made by hand, in small batches, never rushed." },
  { icon: "🎁", title: "Gift worthy", text: "Beautiful to give and even better to keep." },
  { icon: "💬", title: "Easy ordering", text: "Order in a tap on WhatsApp, or buy on Amazon." },
];

const LEAVES = [
  { left: "6%", top: "16%", size: 46, dur: 9, delay: 0, rot: -20 },
  { left: "88%", top: "12%", size: 38, dur: 11, delay: 1.5, rot: 30 },
  { left: "12%", top: "72%", size: 56, dur: 10, delay: 0.8, rot: 15 },
  { left: "80%", top: "68%", size: 44, dur: 12, delay: 2.2, rot: -35 },
  { left: "48%", top: "6%", size: 30, dur: 8, delay: 3, rot: 10 },
  { left: "30%", top: "88%", size: 34, dur: 9.5, delay: 1, rot: 40 },
];

/* ---------- SMALL PIECES ---------- */

// a golden leaf that drifts slowly
function Leaf({ l }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      className="pointer-events-none absolute text-gold"
      style={{ left: l.left, top: l.top, width: l.size, height: l.size, opacity: 0.35 }}
      animate={{ y: [0, -24, 0], rotate: [l.rot, l.rot + 18, l.rot] }}
      transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M12 2C6 8 4 14 12 22C20 14 18 8 12 2Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 6V20M12 12L8.5 9M12 15L15.5 11.5" />
    </motion.svg>
  );
}

// gold sparkles that follow your finger / mouse
function Sparkles() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const parts = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let lastX = -999;
    let lastY = -999;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // draws a 4 point star
    const star = (x, y, r) => {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.life -= 0.018;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.c;
        star(p.x, p.y, p.r * (0.4 + p.life));
      }
      ctx.globalAlpha = 1;
      if (parts.length) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const spawn = (e) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - lastX, y - lastY) < 14) return;
      lastX = x;
      lastY = y;
      for (let i = 0; i < 2; i++) {
        if (parts.length > 120) parts.shift();
        parts.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * -0.8,
          life: 1,
          r: Math.random() * 6 + 4,
          c: Math.random() > 0.5 ? "#ecdcae" : "#c9a961",
        });
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    size();
    host.addEventListener("pointermove", spawn);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", spawn);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-20" />;
}

// words that rise up one by one
function Words({ text, delay = 0, className = "" }) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="mr-[0.25em] inline-block overflow-hidden py-1 align-bottom">
      <motion.span
        className={`inline-block ${className}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: delay + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {word}
      </motion.span>
    </span>
  ));
}

/* ---------- THE PAGE ---------- */

export default function Cosmetics() {
  const [q, setQ] = useState("");

  // products come live from Firebase
  const { products: all, loading } = useProducts("cosmetics");

  const products = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((p) =>
      `${p.name} ${p.description}`.toLowerCase().includes(term)
    );
  }, [all, q]);

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative isolate flex min-h-svh items-center overflow-hidden border-b border-gold/40 bg-[#0e0b06] px-5 pb-20 pt-28 sm:px-8 lg:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(201,169,97,0.25),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(154,123,52,0.22),transparent_50%)]" />
        {LEAVES.map((l, i) => (
          <Leaf key={i} l={l} />
        ))}
        <Sparkles />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* arch with logo */}
          <motion.div
            className="relative mx-auto w-[min(66vw,20rem)] lg:order-2 lg:w-[min(34vw,27rem)]"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* spinning rings with glowing dots */}
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_20px_#c9a961]" />
            </motion.div>
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-gold-light shadow-[0_0_16px_#ecdcae]" />
            </motion.div>

            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border-2 border-gold/60 bg-[radial-gradient(circle_at_50%_35%,#3d2f16,#120e07_75%)] shadow-[0_0_80px_rgba(201,169,97,0.25)]">
              <div className="absolute inset-2 rounded-t-full border border-gold/30" />
              <img
                src={logoMain}
                alt="Nxt Vibe Nature Touch Handmades"
                className="animate-float absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_25px_rgba(201,169,97,0.4)]"
              />
              <motion.div
                className="absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/15 to-transparent"
                initial={{ left: "-50%" }}
                animate={{ left: "150%" }}
                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* text */}
          <div className="text-center lg:order-1 lg:text-left">
            <motion.p
              className="flex items-center justify-center gap-3 font-display text-xs uppercase tracking-[0.4em] text-gold lg:justify-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="h-px w-8 bg-gold" />
              Nature Touch Handmades
            </motion.p>

            <h1
              aria-label="Beauty, born from nature."
              className="mt-5 font-display text-[clamp(2.3rem,6.2vw,4.75rem)] font-bold leading-[1.05] text-gold-light"
            >
              <Words text="Beauty, born from" delay={0.4} />
              <Words text="nature." delay={1} className="text-shimmer" />
            </h1>

            <motion.p
              className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-white/70 sm:text-base lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Handmade cosmetics, crafted with care and inspired by nature.
              Pick your favourites and order in one tap.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <a
                href="#shop"
                className="w-full rounded-full bg-linear-to-r from-gold-dark via-gold to-gold-light px-8 py-3.5 text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-ink shadow-[0_0_30px_rgba(201,169,97,0.4)] transition-transform hover:scale-105 active:scale-95 sm:w-auto"
              >
                Shop the collection
              </a>
              <a
                href={whatsappLink("Hello Nxt Vibe! I have a question about your Cosmetics.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full border border-gold/60 px-8 py-3.5 text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-gold-light transition hover:bg-gold/10 active:scale-95 sm:w-auto"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== PROMISES ===== */}
      <section className="bg-ivory px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <motion.div
              key={p.title}
              className="rounded-2xl border border-gold/30 bg-white p-4 text-center shadow-[0_10px_40px_-20px_rgba(154,123,52,0.5)] transition-transform duration-300 hover:-translate-y-1 sm:p-6"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-light/50 text-2xl sm:h-14 sm:w-14">
                {p.icon}
              </div>
              <h3 className="mt-3 font-display text-sm font-bold text-gold-dark sm:text-base">
                {p.title}
              </h3>
              <p className="mt-1 text-xs text-ink/60 sm:text-sm">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SHOP ===== */}
      <section
        id="shop"
        className="relative scroll-mt-20 bg-ivory px-4 pb-20 sm:px-6 sm:pb-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(201,169,97,0.25)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-display text-xs uppercase tracking-[0.5em] text-gold-dark">
              Nature Touch
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wider text-ink sm:text-5xl">
              The <span className="text-shimmer-dark">collection</span>
            </h2>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gold" />
              <span className="text-gold">✦</span>
              <span className="h-px w-16 bg-gold" />
            </div>

            <label className="relative mx-auto mt-8 block w-full max-w-md">
              <span className="sr-only">Search cosmetics</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                🔍
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cosmetics..."
                className="w-full rounded-full border border-gold/50 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold-dark focus:ring-4 focus:ring-gold/20"
              />
            </label>
          </motion.div>

          {loading ? (
            <p className="py-16 text-center text-ink/60">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} section="cosmetics" index={i} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-ink/60">
              No products found. Try another word.
            </p>
          )}
        </div>
      </section>

      {/* ===== BIG CALL TO ACTION ===== */}
      <section className="relative overflow-hidden bg-[#0e0b06] px-5 py-16 text-center sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,97,0.3),transparent_60%)]" />
        <motion.div
          className="relative mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl font-bold text-gold-light sm:text-4xl">
            Can't find what you need?
          </h2>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            Message us and we will help you choose.
          </p>
          <a
            href={whatsappLink("Hello Nxt Vibe! I need help choosing a cosmetic product.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 active:scale-95"
          >
            💬 Chat on WhatsApp
          </a>
        </motion.div>
      </section>
    </main>
  );
}