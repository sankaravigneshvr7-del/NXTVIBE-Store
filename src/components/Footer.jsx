import { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoMain from "../assets/logos/logo-main.png";
import logoFashions from "../assets/logos/logo-fashions.png";
import logoSnacks from "../assets/logos/logo-snacks.png";
import logoRc from "../assets/logos/logo-rc.png";
import { whatsappLink } from "../lib/whatsapp";

/* ---------- LINKS ---------- */

const WORLDS = [
  { to: "/cosmetics", label: "Cosmetics", note: "Nature Touch Handmades" },
  { to: "/fashions", label: "Fashions", note: "T-shirts & dresses" },
  { to: "/snacks", label: "Healthy Snacks", note: "Tasty bites, zero guilt" },
  { to: "/rc-cars", label: "RC Cars", note: "Built for speed & mud" },
];

/* ---------- ONE LOOK FOR EACH PAGE ---------- */

const THEMES = {
  home: {
    key: "home",
    top: "line",
    pad: "pt-14 sm:pt-20",
    bg: { background: "#0b0906" },
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,97,0.2),transparent_60%)]",
    tag: "Four worlds, one vibe. Handmade beauty, street style, healthy snacks and RC adventures.",
    head: "font-display text-xs font-bold uppercase tracking-[0.35em] text-gold",
    brand: "text-shimmer font-display text-2xl font-bold tracking-[0.3em]",
    body: "text-white/60",
    link: "text-white/85 group-hover:text-gold-light",
    note: "text-white/40",
    divLine: "bg-gold/30",
    star: "text-gold",
    box: "border-gold/20 bg-white/5 text-white/60",
    boxStrong: "text-gold-light",
    copy: "text-white/40",
    back: "border border-gold/40 text-gold hover:bg-gold/10 font-display uppercase tracking-[0.25em]",
    radius: "rounded-full",
  },
  cosmetics: {
    key: "cosmetics",
    top: "line",
    pad: "pt-14 sm:pt-20",
    bg: { background: "linear-gradient(180deg,#fff8e6 0%,#ecdcae 100%)" },
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,97,0.35),transparent_65%)]",
    tag: "Nature Touch Handmades. Beauty, born from nature.",
    head: "font-display text-xs font-bold uppercase tracking-[0.35em] text-gold-dark",
    brand: "text-shimmer-dark font-display text-2xl font-bold tracking-[0.3em]",
    body: "text-ink/70",
    link: "text-ink/85 group-hover:text-gold-dark",
    note: "text-ink/50",
    divLine: "bg-gold-dark/30",
    star: "text-gold-dark",
    box: "border-gold-dark/30 bg-white/60 text-ink/70",
    boxStrong: "text-gold-dark",
    copy: "text-ink/50",
    back: "border border-gold-dark/50 text-gold-dark hover:bg-gold/25 font-display uppercase tracking-[0.25em]",
    radius: "rounded-full",
  },
  fashions: {
    key: "fashions",
    top: "line",
    pad: "pt-14 sm:pt-20",
    bg: { background: "#02060f" },
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(24,60,140,0.55),transparent_60%)]",
    tag: "Wear the next vibe. T-shirts and dresses with a stylish edge.",
    head: "font-display text-xs font-bold uppercase tracking-[0.35em] text-gold",
    brand: "text-shimmer font-display text-2xl font-bold tracking-[0.3em]",
    body: "text-white/60",
    link: "text-white/85 group-hover:text-gold-light",
    note: "text-white/40",
    divLine: "bg-white/15",
    star: "text-gold",
    box: "border-white/10 bg-white/5 text-white/60",
    boxStrong: "text-gold-light",
    copy: "text-white/40",
    back: "border border-gold/40 text-gold hover:bg-gold/10 font-display uppercase tracking-[0.25em]",
    radius: "rounded-full",
  },
  snacks: {
    key: "snacks",
    top: "wave",
    pad: "pt-20 sm:pt-28",
    bg: { background: "#7b3100" },
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,154,60,0.35),transparent_60%)]",
    tag: "Snack smart! Tasty bites that love you back.",
    head: "text-xs font-extrabold uppercase tracking-[0.3em] text-[#ffc778]",
    brand: "text-2xl font-extrabold tracking-[0.2em] text-[#ffc778]",
    body: "text-[#fff0d4]/70",
    link: "text-[#fff0d4] group-hover:text-[#ffc778]",
    note: "text-[#fff0d4]/50",
    divLine: "bg-[#ffc778]/30",
    star: "text-[#ffc778]",
    box: "border-2 border-[#ffc778]/40 bg-[#fff0d4]/10 text-[#fff0d4]/80",
    boxStrong: "text-[#ffc778]",
    copy: "text-[#fff0d4]/60",
    back: "border-2 border-[#ffc778] text-[#ffc778] hover:bg-[#ffc778]/15 font-bold uppercase tracking-widest",
    radius: "rounded-full",
  },
  rc: {
    key: "rc",
    top: "hazard",
    pad: "pt-14 sm:pt-20",
    bg: { background: "#000000" },
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,122,0,0.28),transparent_60%)]",
    tag: "Full throttle. Zero limits.",
    head: "text-xs font-extrabold uppercase italic tracking-[0.3em] text-orange-500",
    brand: "text-2xl font-extrabold uppercase italic tracking-tighter text-orange-500",
    body: "text-white/60",
    link: "text-white/85 group-hover:text-orange-400",
    note: "text-white/40",
    divLine: "bg-orange-500/40",
    star: "text-orange-500",
    box: "border-orange-500/30 bg-white/5 text-white/60",
    boxStrong: "text-orange-400",
    copy: "text-white/40",
    back: "border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-extrabold italic uppercase tracking-widest",
    radius: "rounded-none",
  },
};

// choose the look from the page address
function pickTheme(pathname) {
  if (pathname.startsWith("/cosmetics")) return THEMES.cosmetics;
  if (pathname.startsWith("/fashions")) return THEMES.fashions;
  if (pathname.startsWith("/snacks")) return THEMES.snacks;
  if (pathname.startsWith("/rc-cars")) return THEMES.rc;
  return THEMES.home;
}

/* ---------- THE LOGO (different for each page) ---------- */

function FooterLogo({ k }) {
  if (k === "cosmetics") {
    return (
      <span className="rounded-full bg-ink p-1.5 shadow-lg ring-2 ring-gold-dark/60">
        <img src={logoMain} alt="Nxt Vibe" className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
      </span>
    );
  }
  if (k === "fashions") {
    return (
      <img
        src={logoFashions}
        alt="Nxt Vibe Fashions"
        className="h-28 w-28 object-contain mix-blend-screen sm:h-32 sm:w-32"
      />
    );
  }
  if (k === "snacks") {
    return (
      <span className="block aspect-[1/0.7] w-36 overflow-hidden rounded-3xl bg-[#fff0d4] sm:w-40">
        <img
          src={logoSnacks}
          alt="Nxt Vibe Healthy Snacks"
          className="-mt-[22%] w-full mix-blend-multiply"
        />
      </span>
    );
  }
  if (k === "rc") {
    return (
      <img
        src={logoRc}
        alt="Nxt Vibe RC Cars"
        className="h-24 w-24 rounded-lg border-2 border-orange-500 object-cover sm:h-28 sm:w-28"
      />
    );
  }
  return (
    <img
      src={logoMain}
      alt="Nxt Vibe"
      className="h-24 w-24 object-contain drop-shadow-[0_0_20px_rgba(201,169,97,0.35)] sm:h-28 sm:w-28"
    />
  );
}

/* ---------- THE FOOTER ---------- */

export default function Footer() {
  const { pathname } = useLocation();
  const t = pickTheme(pathname);
  const year = new Date().getFullYear();

  // secret door: tap the © text 5 times quickly to open the admin login
  const navigate = useNavigate();
  const taps = useRef({ count: 0, timer: null });
  const secretTap = () => {
    const t2 = taps.current;
    t2.count += 1;
    clearTimeout(t2.timer);
    t2.timer = setTimeout(() => {
      t2.count = 0;
    }, 1500); // taps must be less than 1.5 seconds apart
    if (t2.count >= 5) {
      t2.count = 0;
      navigate("/admin/login");
    }
  };

  return (
    <footer className="relative overflow-hidden" style={t.bg}>
      {/* top decoration */}
      {t.top === "line" && (
        <div className="h-[3px] bg-linear-to-r from-transparent via-gold to-transparent" />
      )}
      {t.top === "hazard" && (
        <div
          className="h-2"
          style={{
            background:
              "repeating-linear-gradient(-45deg,#ff7a00 0 12px,#111 12px 24px)",
          }}
        />
      )}
      {t.top === "wave" && (
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-0 h-10 w-full sm:h-14"
          aria-hidden="true"
        >
          <path
            d="M0,0 L1440,0 L1440,36 C1200,86 960,0 720,36 C480,72 240,6 0,46 Z"
            fill="#ff9a3c"
          />
        </svg>
      )}

      <div className={`pointer-events-none absolute inset-0 ${t.glow}`} />

      <div className={`relative mx-auto max-w-7xl px-5 pb-8 sm:px-8 ${t.pad}`}>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex flex-col items-center gap-3 md:items-start">
              <FooterLogo k={t.key} />
              <span className={t.brand}>NXT VIBE</span>
            </Link>
            <p className={`mx-auto mt-4 max-w-xs text-sm font-light leading-relaxed md:mx-0 ${t.body}`}>
              {t.tag}
            </p>
          </div>

          {/* worlds */}
          <nav aria-label="Our worlds" className="text-center md:text-left">
            <h3 className={t.head}>Our worlds</h3>
            <ul className="mt-5 space-y-3">
              {WORLDS.map((w) => (
                <li key={w.to}>
                  <Link
                    to={w.to}
                    className="group inline-flex flex-col transition-transform duration-300 hover:translate-x-1"
                  >
                    <span className={`text-sm font-medium transition-colors ${t.link}`}>
                      {w.label}
                    </span>
                    <span className={`text-xs ${t.note}`}>{w.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* order */}
          <div className="text-center md:col-span-2 md:text-left lg:col-span-1">
            <h3 className={t.head}>Order with us</h3>
            <p className={`mt-5 text-sm leading-relaxed ${t.body}`}>
              Pick a product, tap WhatsApp, and your order message is ready to send.
            </p>
            <a
              href={whatsappLink("Hello Nxt Vibe! I would like to know more.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center gap-2 bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(37,211,102,0.3)] transition-transform hover:scale-105 active:scale-95 ${t.radius}`}
            >
              <span aria-hidden="true">💬</span> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* divider */}
        <div className="my-10 flex items-center justify-center gap-3">
          <span className={`h-px flex-1 ${t.divLine}`} />
          <span className={t.star}>✦</span>
          <span className={`h-px flex-1 ${t.divLine}`} />
        </div>

        {/* affiliate disclosure */}
        <p
          className={`mx-auto max-w-3xl rounded-xl border px-4 py-3 text-center text-xs leading-relaxed ${t.box}`}
        >
          <strong className={`font-semibold ${t.boxStrong}`}>Affiliate disclosure:</strong>{" "}
          Some product links on this website are Amazon affiliate links. If you
          buy through them, we may earn a small commission at no extra cost to
          you. As an Amazon Associate we earn from qualifying purchases.
        </p>

        {/* bottom row */}
        <div className={`mt-8 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row ${t.copy}`}>
          <p
            onClick={secretTap}
            className="cursor-default touch-manipulation select-none"
          >
            © {year} Nxt Vibe. All rights reserved.
          </p>

          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${t.back} ${t.radius}`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.93 }}
          >
            Back to top <span aria-hidden="true">↑</span>
          </motion.button>
        </div>

        {/* developer credit */}
        <p className={`mt-6 text-center text-xs ${t.copy}`}>
          Developed by{" "}
          <a
            href="https://dev-a-tech.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold transition-colors hover:underline hover:underline-offset-4 ${t.boxStrong}`}
          >
            Dev-A Technologies
          </a>
        </p>
      </div>
    </footer>
  );
}