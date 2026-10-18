import { useMemo, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import logoFashions from "../assets/logos/logo-fashions.png";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { whatsappLink } from "../lib/whatsapp";

/* ---------- EDIT THESE TEXTS ANYTIME ---------- */

// the filter buttons look for these words in the product name/description
const FILTERS = [
  { label: "All", words: [] },
  { label: "T-Shirts", words: ["t-shirt", "tee", "shirt"] },
  { label: "Dresses", words: ["dress"] },
];

const PERKS = [
  { icon: "🧵", title: "Comfortable fabrics", text: "Pieces that feel as good as they look." },
  { icon: "🖤", title: "Clean, bold looks", text: "Navy, black and gold. Easy to match with anything." },
  { icon: "📏", title: "Size help on chat", text: "Not sure about your size? Ask us on WhatsApp." },
];

/* ---------- SMALL PIECES ---------- */

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

// a card that tilts in 3D toward your mouse / finger
function Tilt3D({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), { stiffness: 150, damping: 14 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 14 });
  const gx = useTransform(x, [-0.5, 0.5], ["20%", "80%"]);
  const gy = useTransform(y, [-0.5, 0.5], ["20%", "80%"]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerUp={reset}
      style={{ perspective: 900 }}
      className="touch-pan-y"
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[2rem]"
          style={{ background: sheen }}
        />
      </motion.div>
    </div>
  );
}

// moving strip with outlined letters
function OutlineMarquee() {
  const items = ["Streetwear", "T-Shirts", "Dresses", "New drops"];
  const row = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-black py-4 sm:py-6">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span
                key={i}
                className="mx-6 flex items-center font-display text-3xl font-bold uppercase text-transparent [-webkit-text-stroke:1px_#ecdcae] sm:mx-10 sm:text-5xl"
              >
                {t}
                <span className="ml-6 text-xl text-gold sm:ml-10">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- THE PAGE ---------- */

export default function Fashions() {
  const [filter, setFilter] = useState(0);
  const [q, setQ] = useState("");

  // giant words slide sideways while you scroll
  const { scrollY } = useScroll();
  const slideLeft = useTransform(scrollY, [0, 900], [0, -300]);
  const slideRight = useTransform(scrollY, [0, 900], [-300, 0]);

  // products come live from Firebase
  const { products: all, loading } = useProducts("fashions");

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
    <main className="bg-[#050b1a]">
      {/* ===== HERO ===== */}
      <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-black px-5 pb-20 pt-28 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(24,60,140,0.55),transparent_55%),radial-gradient(circle_at_10%_90%,rgba(236,220,174,0.1),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_14px)]" />

        {/* giant outlined words */}
        <div className="pointer-events-none absolute inset-0 flex select-none flex-col justify-center overflow-hidden" aria-hidden="true">
          <motion.p
            style={{ x: slideLeft }}
            className="whitespace-nowrap font-display text-[20vw] font-bold leading-[0.9] text-transparent [-webkit-text-stroke:1px_rgba(143,168,224,0.22)]"
          >
            STYLE STYLE STYLE
          </motion.p>
          <motion.p
            style={{ x: slideRight }}
            className="whitespace-nowrap font-display text-[20vw] font-bold leading-[0.9] text-transparent [-webkit-text-stroke:1px_rgba(236,220,174,0.18)]"
          >
            NEXT NEXT NEXT
          </motion.p>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* text */}
          <div className="text-center lg:text-left">
            <motion.p
              className="flex items-center justify-center gap-3 font-display text-xs uppercase tracking-[0.4em] text-gold lg:justify-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="h-px w-8 bg-gold" />
              Nxt Vibe Fashions
            </motion.p>

            <h1
              aria-label="Wear the next vibe."
              className="mt-5 font-display text-[clamp(2.4rem,6.5vw,5.25rem)] font-bold uppercase leading-[1.02] text-white"
            >
              <Words text="Wear the" delay={0.4} />
              <Words text="next vibe." delay={0.8} className="text-shimmer" />
            </h1>

            <motion.div
              className="mx-auto mt-6 h-px bg-linear-to-r from-gold to-transparent lg:mx-0"
              initial={{ width: 0 }}
              animate={{ width: "min(70%, 18rem)" }}
              transition={{ delay: 1.3, duration: 1 }}
            />

            <motion.p
              className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-white/70 sm:text-base lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              T-shirts and dresses with a stylish edge. Pick your look and
              order in one tap.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.8 }}
            >
              <a
                href="#shop"
                className="w-full rounded-full bg-gold px-8 py-3.5 text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-black shadow-[0_0_30px_rgba(201,169,97,0.4)] transition-transform hover:scale-105 active:scale-95 sm:w-auto"
              >
                Shop the drop
              </a>
              <a
                href={whatsappLink("Hello Nxt Vibe! I have a question about your Fashions.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full border border-white/30 px-8 py-3.5 text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:bg-white/10 active:scale-95 sm:w-auto"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          </div>

          {/* tilting logo card */}
          <motion.div
            className="relative mx-auto w-[min(76vw,26rem)]"
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute -inset-5 rounded-[2.5rem] border border-dashed border-gold/30"
              animate={{ rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-3xl" />
            <Tilt3D>
              <div className="overflow-hidden rounded-[2rem] border border-gold/40 bg-black p-3 shadow-[0_30px_80px_-20px_rgba(20,60,160,0.7)]">
                <img src={logoFashions} alt="Nxt Vibe Fashions" className="w-full" />
              </div>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      <OutlineMarquee />

      {/* ===== PERKS ===== */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3 sm:gap-6">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold/60"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <div className="text-4xl">{p.icon}</div>
              <h3 className="mt-3 font-display text-base font-bold tracking-wide text-gold-light">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SHOP ===== */}
      <section id="shop" className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-display text-xs uppercase tracking-[0.5em] text-gold">
              The drop
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wider text-white sm:text-5xl">
              Pick your <span className="text-shimmer">look</span>
            </h2>

            {/* filter buttons */}
            <div className="mt-8 inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1.5">
              {FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFilter(i)}
                  className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors sm:px-6 ${
                    filter === i ? "text-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  {filter === i && (
                    <motion.span
                      layoutId="fashion-pill"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              ))}
            </div>

            <label className="relative mx-auto mt-5 block w-full max-w-md">
              <span className="sr-only">Search fashions</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fashions..."
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-gold focus:ring-4 focus:ring-gold/20"
              />
            </label>
          </motion.div>

          {loading ? (
            <p className="py-16 text-center text-white/60">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} section="fashions" index={i} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-white/60">
              {all.length === 0 ? "New products are coming soon ✨" : "No products found. Try another word."}
            </p>
          )}
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="relative overflow-hidden border-t border-gold/30 bg-black px-5 py-16 text-center sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,60,140,0.5),transparent_60%)]" />
        <motion.div
          className="relative mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl font-bold uppercase text-white sm:text-4xl">
            Need <span className="text-shimmer">styling help?</span>
          </h2>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            Tell us the vibe and your size. We will help you pick.
          </p>
          <a
            href={whatsappLink("Hello Nxt Vibe! I need help choosing an outfit. My size is: ")}
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