import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import logoSnacks from "../assets/logos/logo-snacks.png";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { whatsappLink } from "../lib/whatsapp";

/* ---------- EDIT THESE TEXTS ANYTIME ---------- */

// the filter buttons look for these words in the product name/description
const FILTERS = [
  { label: "All 🍽️", words: [] },
  { label: "Sweet 🍯", words: ["choco", "date", "honey", "sweet"] },
  { label: "Crunchy 🥜", words: ["crunch", "crisp", "makhana", "granola", "cookie"] },
];

const FEATURES = [
  { icon: "🌾", title: "Wholesome stuff", text: "Snacks you can feel good about." },
  { icon: "😋", title: "Seriously tasty", text: "Healthy does not have to mean boring." },
  { icon: "🎒", title: "Snack anywhere", text: "Easy to pack for school, work or travel." },
];

// emojis you can drag around in the hero
const EMOJIS = [
  { e: "🍪", left: "6%", top: "16%", size: "text-5xl sm:text-7xl" },
  { e: "🥜", left: "82%", top: "12%", size: "text-4xl sm:text-6xl" },
  { e: "🍯", left: "4%", top: "66%", size: "text-5xl sm:text-6xl" },
  { e: "🍓", left: "86%", top: "58%", size: "text-4xl sm:text-6xl" },
  { e: "🍫", left: "44%", top: "86%", size: "text-4xl sm:text-5xl" },
];

/* ---------- SMALL PIECES ---------- */

// letters that drop in and bounce when you touch them
function Bouncy({ text, delay = 0 }) {
  return (
    <span className="block" aria-hidden="true">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block cursor-default"
          style={{ color: i % 2 ? "#ff7a00" : "#7b3100" }}
          initial={{ y: -140, opacity: 0, rotate: -20 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 12, delay: delay + i * 0.07 }}
          whileHover={{ y: -16, rotate: i % 2 ? 8 : -8, scale: 1.15 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

// round badge with text that spins
function Badge() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="h-28 w-28 sm:h-36 sm:w-36"
      animate={{ rotate: 360 }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <path id="snackCircle" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#7b3100" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#ffc778" strokeWidth="1.5" strokeDasharray="3 5" />
      <text fontSize="16" fontWeight="700" fill="#fff0d4" textLength="462" lengthAdjust="spacing">
        <textPath href="#snackCircle">
          100% HEALTHY • 100% TASTY • NO GUILT •{" "}
        </textPath>
      </text>
      <text x="100" y="118" textAnchor="middle" fontSize="52">🍪</text>
    </motion.svg>
  );
}

// moving strip with snack words
function SnackMarquee() {
  const items = [
    ["🍪", "CRUNCH"],
    ["🥜", "MUNCH"],
    ["🍯", "YUM"],
    ["🍓", "FRESH"],
    ["🍫", "TASTY"],
  ];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-[#fffaf0] py-6 sm:py-8">
      <div className="-rotate-1 scale-[1.04] bg-[#7b3100] py-3 shadow-lg sm:py-4">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {row.map(([emoji, word], i) => (
                <span
                  key={i}
                  className="mx-5 flex items-center gap-3 text-lg font-bold tracking-widest text-[#fff0d4] sm:mx-8 sm:text-2xl"
                >
                  <span className="text-2xl sm:text-3xl">{emoji}</span>
                  {word}
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

export default function Snacks() {
  const heroRef = useRef(null);
  const [filter, setFilter] = useState(0);
  const [q, setQ] = useState("");

  // products come live from Firebase
  const { products: all, loading } = useProducts("snacks");

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
    <main className="bg-[#fffaf0]">
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative flex min-h-svh items-center overflow-hidden px-5 pb-32 pt-28 sm:px-8"
        style={{ background: "linear-gradient(160deg,#fff0d4 0%,#ffc778 55%,#ff9a3c 100%)" }}
      >
        {/* soft floating blobs */}
        <motion.div
          className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-white/40 blur-2xl"
          animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-[#ff7a00]/30 blur-3xl"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* content (no z-index here, so the logo can blend with the background) */}
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
          {/* text */}
          <div className="text-center lg:text-left">
            <motion.p
              className="inline-block rounded-full border-2 border-[#7b3100] bg-white/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-[#7b3100]"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              Nxt Vibe Healthy Snacks
            </motion.p>

            <h1
              aria-label="Snack smart."
              className="mt-5 text-[clamp(3.2rem,13vw,8rem)] font-bold leading-[0.95] tracking-tight"
            >
              <Bouncy text="SNACK" delay={0.4} />
              <Bouncy text="SMART." delay={0.9} />
            </h1>

            <motion.p
              className="mx-auto mt-6 max-w-md text-base font-medium leading-relaxed text-[#7b3100]/80 lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.7 }}
            >
              Tasty bites that love you back. Pick your crunch and order in one tap.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.7 }}
            >
              <motion.a
                href="#shop"
                className="w-full rounded-full bg-[#7b3100] px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-[#fff0d4] shadow-[5px_5px_0_#ff7a00] sm:w-auto"
                whileHover={{ scale: 1.06, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's snack 🍪
              </motion.a>
              <motion.a
                href={whatsappLink("Hello Nxt Vibe! I have a question about your Healthy Snacks.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full border-2 border-[#7b3100] bg-white/60 px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-[#7b3100] sm:w-auto"
                whileHover={{ scale: 1.06, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                Chat on WhatsApp
              </motion.a>
            </motion.div>

            <motion.p
              className="mt-5 text-xs font-semibold text-[#7b3100]/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.5] }}
              transition={{ delay: 2.6, duration: 2 }}
            >
              psst… try dragging the snacks 👆
            </motion.p>
          </div>

          {/* logo (blend class sits on the element that moves) */}
          <div className="relative mx-auto w-[min(80vw,28rem)]">
            <motion.div
              className="aspect-[1/0.78] overflow-hidden mix-blend-multiply"
              initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, -3, 3, -3, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.5 },
                scale: { type: "spring", stiffness: 120, damping: 10, delay: 0.5 },
                rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
              }}
            >
              <img src={logoSnacks} alt="Nxt Vibe Healthy Snacks" className="-mt-[22%] w-full" />
            </motion.div>
            <div className="absolute -bottom-6 -right-2 sm:-right-6">
              <Badge />
            </div>
          </div>
        </div>

        {/* draggable emojis */}
        <div className="pointer-events-none absolute inset-0">
          {EMOJIS.map((item, i) => (
            <motion.div
              key={item.e}
              className="pointer-events-auto absolute cursor-grab touch-none select-none active:cursor-grabbing"
              style={{ left: item.left, top: item.top }}
              drag
              dragConstraints={heroRef}
              dragElastic={0.35}
              whileTap={{ scale: 1.35 }}
              whileDrag={{ scale: 1.35, zIndex: 50 }}
            >
              <motion.span
                className={`block drop-shadow-lg ${item.size}`}
                animate={{ y: [0, -14, 0], rotate: [-8, 8, -8] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {item.e}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* wavy bottom */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-px left-0 h-16 w-full sm:h-24"
        >
          <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,16 1440,64 L1440,120 L0,120 Z" fill="#fffaf0" />
        </svg>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-16">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-3xl border-2 border-[#7b3100] bg-white p-6 text-center shadow-[6px_6px_0_#ffb15c]"
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 12, delay: i * 0.1 }}
              whileHover={{ rotate: [0, -3, 3, 0], transition: { duration: 0.5 } }}
            >
              <div className="text-5xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-bold text-[#7b3100]">{f.title}</h3>
              <p className="mt-1 text-sm text-[#7b3100]/70">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <SnackMarquee />

      {/* ===== SHOP ===== */}
      <section id="shop" className="scroll-mt-20 px-4 pb-20 pt-10 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold tracking-tight text-[#7b3100] sm:text-6xl">
              Pick your <span className="text-[#ff7a00]">crunch!</span>
            </h2>

            <div className="mt-8 inline-flex flex-wrap justify-center gap-2">
              {FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFilter(i)}
                  className={`relative rounded-full border-2 border-[#7b3100] px-5 py-2 text-sm font-bold transition-colors ${
                    filter === i ? "text-[#fff0d4]" : "bg-white text-[#7b3100] hover:bg-orange-100"
                  }`}
                >
                  {filter === i && (
                    <motion.span
                      layoutId="snack-pill"
                      className="absolute inset-0 rounded-full bg-[#7b3100]"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              ))}
            </div>

            <label className="relative mx-auto mt-5 block w-full max-w-md">
              <span className="sr-only">Search snacks</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search snacks..."
                className="w-full rounded-full border-2 border-[#7b3100] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4 focus:ring-orange-300"
              />
            </label>
          </motion.div>

          {loading ? (
            <p className="py-16 text-center text-[#7b3100]/70">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} section="snacks" index={i} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-[#7b3100]/70">{all.length === 0 ? "New products are coming soon ✨" : "No products found. Try another word."}🍪</p>
          )}
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section
        className="relative overflow-hidden px-5 py-16 text-center sm:py-24"
        style={{ background: "linear-gradient(160deg,#ffc778,#ff9a3c)" }}
      >
        <motion.div
          className="relative mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-6xl"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            🍪
          </motion.div>
          <h2 className="mt-3 text-3xl font-bold text-[#7b3100] sm:text-5xl">Still hungry?</h2>
          <p className="mt-3 text-base font-medium text-[#7b3100]/80">
            Tell us what you like and we will suggest the perfect snack.
          </p>
          <motion.a
            href={whatsappLink("Hello Nxt Vibe! Please suggest some healthy snacks for me.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block rounded-full bg-[#25D366] px-8 py-4 text-sm font-bold text-white shadow-[5px_5px_0_#7b3100]"
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.94 }}
          >
            💬 Chat on WhatsApp
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
}