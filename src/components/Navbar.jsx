import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/logos/logo-main.png";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/cosmetics", label: "Cosmetics" },
  { to: "/fashions", label: "Fashions" },
  { to: "/snacks", label: "Snacks" },
  { to: "/rc-cars", label: "RC Cars" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // turn the navbar solid after scrolling a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu when the page changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // stop the page from scrolling behind the open menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // transparent only on top of the home hero, solid everywhere else
  const solid = scrolled || open || pathname !== "/";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "bg-ink/90 shadow-[0_1px_0_rgba(201,169,97,0.35)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
          {/* brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img
              src={logo}
              alt="Nxt Vibe logo"
              className="h-11 w-11 object-contain sm:h-14 sm:w-14"
            />
            <span className="text-shimmer font-display text-lg font-bold tracking-[0.25em] sm:text-xl">
              NXT VIBE
            </span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="group relative py-2">
                {({ isActive }) => (
                  <>
                    <span
                      className={`font-display text-xs uppercase tracking-[0.25em] transition-colors ${
                        isActive ? "text-gold" : "text-white/70 group-hover:text-gold-light"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* mobile hamburger button */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-0.5 w-6 bg-gold transition-all duration-300 ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-gold transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-gold transition-all duration-300 ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* mobile full screen menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-center gap-1 bg-ink px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 md:hidden"
            initial={{ clipPath: "circle(0% at 90% 5%)" }}
            animate={{ clipPath: "circle(150% at 90% 5%)" }}
            exit={{ clipPath: "circle(0% at 90% 5%)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(201,169,97,0.2),transparent_55%)]" />
            {LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.5 }}
              >
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-baseline gap-4 border-b border-white/10 py-4 font-display text-3xl uppercase tracking-widest transition-colors ${
                      isActive ? "text-gold" : "text-white/80"
                    }`
                  }
                >
                  <span className="text-xs tracking-[0.3em] text-gold/60">
                    0{i + 1}
                  </span>
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}