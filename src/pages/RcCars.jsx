import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import logoRc from "../assets/logos/logo-rc.png";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { whatsappLink } from "../lib/whatsapp";

/* ---------- EDIT THESE TEXTS ANYTIME ---------- */

// the filter buttons look for these words in the product name/description
const FILTERS = [
  { label: "All", words: [] },
  { label: "Off-road", words: ["crawler", "monster", "rock", "mud"] },
  { label: "Construction", words: ["excavator", "dump", "digger", "hauler"] },
];

const FEATURES = [
  { no: "01", title: "Built tough", text: "Big tyres and strong bodies for mud, rocks and rough ground." },
  { no: "02", title: "Pure control", text: "Smooth remote control so every move feels sharp." },
  { no: "03", title: "Non-stop fun", text: "Climb, dig, haul and jump. For kids and grown-up kids." },
];

// thin lines that race across the hero
const LINES = Array.from({ length: 9 }, (_, i) => ({
  top: `${8 + i * 10}%`,
  w: 120 + ((i * 53) % 200),
  dur: 1.2 + (i % 4) * 0.35,
  delay: (i * 0.37) % 1.6,
}));

// the dial arc (from lower-left, over the top, to lower-right)
const ARC = "M 25.52 143 A 86 86 0 1 1 174.48 143";
const TICKS = Array.from({ length: 13 }, (_, i) => -120 + i * 20);

/* ---------- SMALL PIECES ---------- */

// headline words that slam in from the left
function Slam({ text, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden pb-1 pr-6">
      <motion.span
        className={`block ${className}`}
        initial={{ x: "-110%", skewX: -25 }}
        animate={{ x: 0, skewX: -8 }}
        transition={{ type: "spring", stiffness: 140, damping: 16, delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

// the speedometer: hold the button to rev!
function Gauge() {
  const rev = useMotionValue(0);
  const spring = useSpring(rev, { stiffness: 55, damping: 10 });
  const needle = useTransform(spring, [0, 1], [-120, 120]);
  const progress = useTransform(spring, (v) => Math.min(Math.max(v, 0), 1));
  const kmh = useTransform(spring, (v) => Math.max(0, Math.round(v * 120)));
  const shake = useTransform(spring, (v) => (v > 0.5 ? (Math.random() - 0.5) * v * 5 : 0));

  // a quick demo rev when the page opens
  useEffect(() => {
    const a = setTimeout(() => rev.set(1), 900);
    const b = setTimeout(() => rev.set(0), 2400);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [rev]);

  const hold = () => rev.set(1);
  const release = () => rev.set(0);

  return (
    <div className="mx-auto w-[min(78vw,22rem)]">
      <motion.div className="relative aspect-square" style={{ x: shake }}>
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <circle cx="100" cy="100" r="96" fill="rgba(0,0,0,0.7)" stroke="rgba(255,122,0,0.55)" strokeWidth="2" />
          <path d={ARC} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" strokeLinecap="round" />
          <motion.path
            d={ARC}
            fill="none"
            stroke="#ff7a00"
            strokeWidth="8"
            strokeLinecap="round"
            style={{ pathLength: progress, filter: "drop-shadow(0 0 6px #ff7a00)" }}
          />
          {TICKS.map((a) => (
            <line
              key={a}
              x1="100"
              y1="22"
              x2="100"
              y2={a % 40 === 0 ? 34 : 30}
              stroke="#ffc400"
              strokeWidth={a % 40 === 0 ? 2.5 : 1.2}
              transform={`rotate(${a} 100 100)`}
            />
          ))}
        </svg>

        {/* needle */}
        <motion.div className="absolute inset-0" style={{ rotate: needle }}>
          <span className="absolute left-1/2 top-[14%] h-[36%] w-[3px] -translate-x-1/2 rounded-full bg-orange-500 shadow-[0_0_12px_#ff7a00]" />
        </motion.div>
        <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-black" />

        {/* speed number */}
        <div className="absolute inset-x-0 bottom-[16%] text-center">
          <motion.span className="font-display text-4xl font-bold tabular-nums text-white sm:text-5xl">
            {kmh}
          </motion.span>
          <span className="block text-[10px] uppercase tracking-[0.4em] text-orange-400">km/h</span>
        </div>
      </motion.div>

      <button
        type="button"
        onPointerDown={hold}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && hold()}
        onKeyUp={release}
        onContextMenu={(e) => e.preventDefault()}
        className="mt-6 w-full touch-none select-none rounded-lg bg-orange-500 px-6 py-4 text-sm font-extrabold uppercase italic tracking-widest text-black shadow-[0_0_30px_rgba(255,122,0,0.5)] transition-transform active:scale-95"
      >
        ⚡ Hold to rev
      </button>
    </div>
  );
}

// orange racing strip
function RaceMarquee() {
  const row = Array.from({ length: 6 }, () => "FULL SEND");
  return (
    <div className="overflow-hidden bg-black py-6">
      <div className="-rotate-1 scale-[1.04] bg-orange-500 py-3 shadow-[0_0_40px_rgba(255,122,0,0.4)]">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {row.map((t, i) => (
                <span
                  key={i}
                  className="mx-5 flex items-center gap-5 text-xl font-extrabold uppercase italic tracking-tight text-black sm:mx-8 sm:text-3xl"
                >
                  {t}
                  <span aria-hidden="true">⚡</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- THE PAGE ---------- */

export default function RcCars() {
  const [filter, setFilter] = useState(0);
  const [q, setQ] = useState("");

  // products come live from Firebase
  const { products: all, loading } = useProducts("rc");

  const products = useMemo(() => {
    const words = FILTERS[filter].words;
    const term = q.trim().toLowerCase();
    return all.filter((p) => {
      const text = `${p.name} ${p.description || ""}`.toLowerCase();
      if (words.length && !words.some((w) => text.includes(w))) return false;
      return !term || text.includes(term);
    });
  }, [all, filter, q]);

  return (
    <main className="bg-black">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-black px-5 pb-20 pt-28 sm:px-8">
        {/* slow zooming poster */}
        <motion.img
          src={logoRc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          animate={{ scale: [1, 1.12] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/75 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/60" />

        {/* speed lines */}
        {LINES.map((l, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-0 h-px bg-linear-to-r from-transparent via-orange-500/70 to-transparent"
            style={{ top: l.top, width: l.w }}
            initial={{ x: "-30vw" }}
            animate={{ x: "110vw" }}
            transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, repeatDelay: 0.8, ease: "linear" }}
          />
        ))}

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* text */}
          <div className="text-center lg:text-left">
            <motion.p
              className="inline-block -skew-x-12 bg-orange-500 px-4 py-1 text-xs font-extrabold uppercase tracking-[0.3em] text-black"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Nxt Vibe RC Cars
            </motion.p>

            <h1
              aria-label="Full throttle. Zero limits."
              className="mt-5 text-[clamp(2.4rem,8vw,6rem)] font-extrabold uppercase italic leading-[0.95] tracking-tighter text-white"
            >
              <Slam text="Full throttle." delay={0.4} />
              <Slam
                text="Zero limits."
                delay={0.7}
                className="bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent"
              />
            </h1>

            <motion.p
              className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/70 sm:text-base lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              Rock crawlers, diggers and monster trucks. Pick your machine and
              order in one tap.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.7 }}
            >
              <a
                href="#shop"
                className="w-full -skew-x-12 bg-orange-500 px-8 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(255,122,0,0.5)] transition-transform hover:scale-105 active:scale-95 sm:w-auto"
              >
                <span className="inline-block skew-x-12">See the machines</span>
              </a>
              <a
                href={whatsappLink("Hello Nxt Vibe! I have a question about your RC Cars.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full -skew-x-12 border-2 border-orange-500 px-8 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-orange-400 transition hover:bg-orange-500/10 active:scale-95 sm:w-auto"
              >
                <span className="inline-block skew-x-12">Chat on WhatsApp</span>
              </a>
            </motion.div>
          </div>

          {/* speedometer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.6 }}
          >
            <Gauge />
          </motion.div>
        </div>
      </section>

      <RaceMarquee />

      {/* ===== FEATURES ===== */}
      <section className="bg-neutral-950 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.no}
              className="relative overflow-hidden border-l-4 border-orange-500 bg-white/5 p-6 transition-colors duration-300 [clip-path:polygon(0_0,100%_0,100%_85%,92%_100%,0_100%)] hover:bg-orange-500/10"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <span className="absolute right-4 top-1 text-6xl font-extrabold italic text-transparent [-webkit-text-stroke:1px_rgba(255,122,0,0.5)]">
                {f.no}
              </span>
              <h3 className="mt-8 text-xl font-extrabold uppercase italic tracking-tight text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SHOP ===== */}
      <section
        id="shop"
        className="scroll-mt-20 bg-neutral-950 px-4 pb-20 sm:px-6 sm:pb-28 [background-image:linear-gradient(rgba(255,122,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,122,0,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-extrabold uppercase italic tracking-tighter text-white sm:text-6xl">
              Pick your <span className="text-orange-500">machine</span>
            </h2>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFilter(i)}
                  className={`-skew-x-12 px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest transition ${
                    filter === i
                      ? "bg-orange-500 text-black shadow-[0_0_20px_rgba(255,122,0,0.5)]"
                      : "border border-white/20 text-white/70 hover:border-orange-500 hover:text-orange-400"
                  }`}
                >
                  <span className="inline-block skew-x-12">{f.label}</span>
                </button>
              ))}
            </div>

            <label className="relative mx-auto mt-5 block w-full max-w-md">
              <span className="sr-only">Search RC cars</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search RC cars..."
                className="w-full border border-white/20 bg-black/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
              />
            </label>
          </motion.div>

          {loading ? (
            <p className="py-16 text-center text-white/60">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} section="rc" index={i} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-white/60">
              {all.length === 0 ? "New Cars are coming soon ✨" : "No products found. Try another word."}
            </p>
          )}
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="relative overflow-hidden bg-orange-500 px-5 py-16 text-center sm:py-24">
        <div className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(-45deg,#000_0_14px,transparent_14px_28px)]" />
        <motion.div
          className="relative mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold uppercase italic tracking-tighter text-black sm:text-6xl">
            Ready to race?
          </h2>
          <p className="mt-3 text-base font-semibold text-black/80">
            Ask us anything about our RC machines.
          </p>
          <a
            href={whatsappLink("Hello Nxt Vibe! I am interested in an RC car. Please help me choose.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block -skew-x-12 bg-black px-9 py-4 text-sm font-extrabold uppercase tracking-widest text-orange-400 shadow-[6px_6px_0_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95"
          >
            <span className="inline-block skew-x-12">💬 Chat on WhatsApp</span>
          </a>
        </motion.div>
      </section>
    </main>
  );
}