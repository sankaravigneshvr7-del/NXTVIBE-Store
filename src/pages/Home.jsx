import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";

import logoMain from "../assets/logos/logo-main.png";
import logoFashions from "../assets/logos/logo-fashions.png";
import logoSnacks from "../assets/logos/logo-snacks.png";
import logoRc from "../assets/logos/logo-rc.png";

/* ---------- DATA ---------- */

const WORLDS = [
  {
    to: "/cosmetics",
    no: "01",
    title: "Cosmetics",
    tag: "Nature Touch Handmades",
    logo: logoMain,
    bg: "radial-gradient(circle at 50% 30%, #3d2f16 0%, #14110c 75%)",
    border: "rgba(201,169,97,0.55)",
    frame: "rgba(201,169,97,0.35)",
    titleColor: "#ecdcae",
    tagColor: "#c9a961",
    numColor: "#c9a961",
    btnBg: "linear-gradient(90deg,#9a7b34,#ecdcae,#c9a961)",
    btnText: "#14110c",
  },
  {
    to: "/fashions",
    no: "02",
    title: "Fashions",
    tag: "T-shirts, dresses & street style",
    logo: logoFashions,
    blend: "mix-blend-screen", // hides the black square of the logo
    bg: "linear-gradient(160deg,#10285c 0%,#08142e 55%,#000000 100%)",
    border: "rgba(120,150,220,0.5)",
    frame: "rgba(236,220,174,0.3)",
    titleColor: "#ffffff",
    tagColor: "#ecdcae",
    numColor: "#8fa8e0",
    btnBg: "#ffffff",
    btnText: "#0a1a3a",
  },
  {
    to: "/snacks",
    no: "03",
    title: "Healthy Snacks",
    tag: "Tasty bites, zero guilt",
    logo: logoSnacks,
    blend: "mix-blend-multiply", // hides the white square of the logo
    shift: -14,
    bg: "linear-gradient(160deg,#fff0d4 0%,#ffc778 55%,#ff9a3c 100%)",
    border: "rgba(123,49,0,0.4)",
    titleColor: "#7b3100",
    tagColor: "#a24800",
    numColor: "#7b3100",
    btnBg: "#7b3100",
    btnText: "#fff0d4",
    emojis: [
      { icon: "🍪", pos: "left-5 top-5", delay: "0s" },
      { icon: "🥜", pos: "right-6 top-10", delay: "1.2s" },
      { icon: "🍯", pos: "left-10 top-[38%]", delay: "2.4s" },
    ],
  },
  {
    to: "/rc-cars",
    no: "04",
    title: "RC Cars",
    tag: "Built for speed & mud",
    poster: logoRc,
    bg: "#000000",
    border: "rgba(255,122,0,0.75)",
    titleColor: "#ffffff",
    tagColor: "#ffc400",
    numColor: "#ff7a00",
    btnBg: "#ff7a00",
    btnText: "#000000",
    hazard: true,
  },
];

const STEPS = [
  {
    icon: "🛍️",
    title: "Pick your vibe",
    text: "Browse our four worlds and find something you love.",
  },
  {
    icon: "💬",
    title: "Order on WhatsApp",
    text: "Tap the WhatsApp button and your order message is ready to send.",
  },
  {
    icon: "🛒",
    title: "Or buy on Amazon",
    text: "Prefer Amazon? Every product also has a Buy link.",
  },
];

/* ---------- SMALL PIECES ---------- */

// floating gold dust in the hero
function GoldDust() {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dots = [];
    let raf = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor(w / 12));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        s: Math.random() * 0.4 + 0.15,
        d: Math.random() * 6.28,
      }));
    };

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ecdcae";
      for (const p of dots) {
        p.y -= p.s;
        p.x += Math.sin(t / 1500 + p.d) * 0.25;
        if (p.y < -5) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }
        ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t / 900 + p.d));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    setup();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

// a line of text where every letter rises up one by one
function Line({ text, delay = 0 }) {
  return (
    <span className="block overflow-hidden py-1" aria-hidden="true">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="text-shimmer inline-block"
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: delay + i * 0.045,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

// the moving strip between hero and cards
function Marquee() {
  const items = ["Cosmetics", "Fashions", "Healthy Snacks", "RC Cars"];
  const row = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-gold/40 bg-ink py-3 sm:py-4">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span
                key={i}
                className="mx-5 flex items-center font-display text-sm uppercase tracking-[0.35em] text-gold sm:mx-8 sm:text-base"
              >
                {t}
                <span className="ml-5 text-gold-light/60 sm:ml-8">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// one big section card
function WorldCard({ w, index, active, setActive }) {
  const isActive = active === index;

  return (
    <motion.div
      className="relative h-80 min-w-0 sm:h-96 lg:h-auto lg:basis-0 lg:transition-[flex-grow] lg:duration-700 lg:ease-out lg:[flex-grow:var(--grow)]"
      style={{ "--grow": isActive ? "3.4" : "1" }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setActive(index)}
    >
      <Link
        to={w.to}
        aria-label={`Enter ${w.title}`}
        onFocus={() => setActive(index)}
        className="group relative block h-full w-full overflow-hidden rounded-3xl border-2 shadow-[0_20px_50px_-20px_rgba(20,17,12,0.55)] outline-none focus-visible:ring-4 focus-visible:ring-gold"
        style={{ background: w.bg, borderColor: w.border }}
      >
        {/* RC card: the whole poster is the background */}
        {w.poster && (
          <>
            <img
              src={w.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            <div
              className={`absolute inset-0 bg-black/50 transition-opacity duration-700 ${
                isActive ? "lg:opacity-0" : "lg:opacity-100"
              }`}
            />
          </>
        )}

        {/* other cards: floating logo */}
        {w.logo && (
          <div
            className={`pointer-events-none absolute left-1/2 top-[36%] w-44 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 sm:w-56 lg:top-[40%] lg:w-[20rem] ${
              w.blend || ""
            } ${isActive ? "lg:scale-100 lg:opacity-100" : "lg:scale-75 lg:opacity-30"}`}
          >
            <div style={{ transform: `translateY(${w.shift || 0}%)` }}>
              <img src={w.logo} alt="" className="animate-float w-full" />
            </div>
          </div>
        )}

        {/* snack emojis */}
        {w.emojis && (
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              isActive ? "" : "lg:opacity-0"
            }`}
          >
            {w.emojis.map((e) => (
              <span
                key={e.icon}
                className={`animate-float absolute text-2xl sm:text-3xl ${e.pos}`}
                style={{ animationDelay: e.delay }}
              >
                {e.icon}
              </span>
            ))}
          </div>
        )}

        {/* thin inner frame */}
        {w.frame && (
          <span
            className="pointer-events-none absolute inset-3 rounded-2xl border"
            style={{ borderColor: w.frame }}
          />
        )}

        {/* sliding shine on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-1000 group-hover:left-full group-hover:opacity-100" />

        {/* vertical title (desktop, when the card is closed) */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center transition-opacity duration-500 lg:flex ${
            isActive ? "opacity-0" : "opacity-100 delay-300"
          }`}
        >
          <span
            className="font-display text-xl font-bold uppercase tracking-[0.4em] [writing-mode:vertical-rl]"
            style={{ color: w.titleColor }}
          >
            {w.title}
          </span>
        </div>

        {/* bottom text */}
        <div
          className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-500 sm:p-7 ${
            isActive
              ? "lg:translate-y-0 lg:opacity-100 lg:delay-300"
              : "lg:translate-y-6 lg:opacity-0"
          }`}
        >
          <span
            className="font-display text-xs font-bold tracking-[0.3em]"
            style={{ color: w.numColor }}
          >
            {w.no}
          </span>
          <h3
            className={`font-display text-2xl font-bold uppercase tracking-wider sm:text-3xl lg:text-4xl ${
              w.poster ? "-skew-x-6" : ""
            }`}
            style={{ color: w.titleColor }}
          >
            {w.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: w.tagColor }}>
            {w.tag}
          </p>
          <span
            className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-transform duration-300 group-hover:translate-x-1"
            style={{ background: w.btnBg, color: w.btnText }}
          >
            Enter <span aria-hidden="true">→</span>
          </span>
        </div>

        {/* RC racing stripe */}
        {w.hazard && (
          <span
            className="absolute inset-x-0 bottom-0 h-2"
            style={{
              background:
                "repeating-linear-gradient(-45deg,#ff7a00 0 12px,#111 12px 24px)",
            }}
          />
        )}
      </Link>
    </motion.div>
  );
}

/* ---------- THE PAGE ---------- */

export default function Home() {
  const heroRef = useRef(null);
  const [active, setActive] = useState(0);

  // glow that follows the finger / mouse
  const mx = useMotionValue(300);
  const my = useMotionValue(250);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(201,169,97,0.22), transparent 65%)`;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  // hero fades and shrinks while you scroll down
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <main>
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        onPointerMove={onMove}
        className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0b0906]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2a2113_0%,#0b0906_72%)]" />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: spot }}
        />
        <GoldDust />

        <motion.div
          style={{ y, opacity: fade, scale }}
          className="relative z-10 flex flex-col items-center px-5 pb-24 pt-28 text-center"
        >
          {/* logo with glow + spinning ring */}
          <div className="animate-float relative">
            <motion.div
              className="absolute -inset-6 rounded-full bg-gold/25 blur-3xl"
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -inset-4 rounded-full border border-dashed border-gold/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.img
              src={logoMain}
              alt="Nxt Vibe"
              className="relative w-[min(58vw,20rem)] drop-shadow-[0_0_30px_rgba(201,169,97,0.45)]"
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <h1
            aria-label="Four worlds. One vibe."
            className="mt-8 font-display text-[clamp(1.75rem,7.2vw,5rem)] font-bold leading-[1.05] tracking-[0.08em]"
          >
            <Line text="FOUR WORLDS." delay={0.8} />
            <Line text="ONE VIBE." delay={1.2} />
          </h1>

          <motion.p
            className="mt-5 max-w-md text-xs font-light uppercase leading-relaxed tracking-[0.2em] text-gold-light/80 sm:text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.8 }}
          >
            Handmade beauty · Street style · Healthy bites · RC adventures
          </motion.p>

          <motion.a
            href="#worlds"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-linear-to-r from-gold-dark via-gold to-gold-light px-8 py-3.5 font-display text-xs font-bold uppercase tracking-[0.3em] text-ink shadow-[0_0_30px_rgba(201,169,97,0.45)] transition-transform hover:scale-105 active:scale-95 sm:text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            Explore the worlds
            <span className="transition-transform group-hover:translate-y-1">↓</span>
          </motion.a>
        </motion.div>

        {/* little scroll mouse */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-9 w-5 justify-center rounded-full border border-gold/50 pt-2">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-gold"
              animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
        </div>
      </section>

      <Marquee />

      {/* ===== 4 WORLDS ===== */}
      <section
        id="worlds"
        className="relative overflow-hidden bg-ivory px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,97,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            className="mb-12 text-center sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-display text-xs uppercase tracking-[0.5em] text-gold-dark">
              Nxt Vibe
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wider text-ink sm:text-5xl">
              Choose your <span className="text-shimmer-dark">world</span>
            </h2>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gold" />
              <span className="text-gold">✦</span>
              <span className="h-px w-16 bg-gold" />
            </div>
            <p className="mt-4 text-sm text-ink/60">
              <span className="hidden lg:inline">
                Hover a card to open it · click to enter
              </span>
              <span className="lg:hidden">Tap a card to enter</span>
            </p>
          </motion.div>

          <div className="flex flex-col gap-5 lg:h-[34rem] lg:flex-row xl:h-[38rem]">
            {WORLDS.map((w, i) => (
              <WorldCard
                key={w.to}
                w={w}
                index={i}
                active={active}
                setActive={setActive}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW TO ORDER ===== */}
      <section className="border-t border-gold/30 bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-10 text-center font-display text-2xl font-bold uppercase tracking-wider text-ink sm:mb-14 sm:text-4xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            How to <span className="text-shimmer-dark">order</span>
          </motion.h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                className="relative overflow-hidden rounded-2xl border border-gold/40 bg-ivory p-6 text-center shadow-[0_10px_40px_-15px_rgba(154,123,52,0.4)] transition-transform duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <span className="absolute right-4 top-2 font-display text-5xl font-bold text-gold/20">
                  {i + 1}
                </span>
                <div className="text-4xl">{s.icon}</div>
                <h3 className="mt-3 font-display text-lg font-bold tracking-wide text-gold-dark">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT (real text that helps Google understand the site) ===== */}
      <section className="bg-ivory px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-ink sm:text-4xl">
            About <span className="text-shimmer-dark">Nxt Vibe</span>
          </h2>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gold" />
            <span className="text-gold">✦</span>
            <span className="h-px w-16 bg-gold" />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink/70 sm:text-base">
            Nxt Vibe is an online store with four worlds under one brand. Under{" "}
            <Link to="/cosmetics" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
              Nature Touch Handmades
            </Link>{" "}
            you will find handmade cosmetics inspired by nature.{" "}
            <Link to="/fashions" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
              Nxt Vibe Fashions
            </Link>{" "}
            brings stylish T-shirts and dresses.{" "}
            <Link to="/snacks" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
              Nxt Vibe Healthy Snacks
            </Link>{" "}
            offers tasty bites you can feel good about, and{" "}
            <Link to="/rc-cars" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
              Nxt Vibe RC Cars
            </Link>{" "}
            has rock crawlers, trucks and excavators for every RC fan.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
            Every product has a WhatsApp order button and an Amazon buy link, so
            you can shop the way you like. Explore the store and find your next vibe.
          </p>
        </motion.div>
      </section>
    </main>
  );
}