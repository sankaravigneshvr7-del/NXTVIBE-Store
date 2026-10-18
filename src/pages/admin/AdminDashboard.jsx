import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import SafeImage from "../../components/SafeImage";
import { optimizeImage } from "../../lib/cloudinary";
import {
  SECTIONS,
  sectionOf,
  finalPrice,
  formatMoney,
  friendlyDbError,
} from "../../lib/catalog";

const CHIPS = [{ key: "all", label: "All", emoji: "✨" }, ...SECTIONS];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { products, loading, error } = useProducts();
  const location = useLocation();

  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState(location.state?.msg || "");
  const [err, setErr] = useState("");
  const [toDelete, setToDelete] = useState(null);

  // the green message disappears after 4 seconds
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  const counts = useMemo(() => {
    const c = { all: products.length };
    SECTIONS.forEach((s) => (c[s.key] = 0));
    products.forEach((p) => {
      if (c[p.section] !== undefined) c[p.section] += 1;
    });
    return c;
  }, [products]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (filter === "all" || p.section === filter) &&
        (!term || `${p.name} ${p.description || ""}`.toLowerCase().includes(term))
    );
  }, [products, filter, q]);

  const toggleStock = (p) => {
    setErr("");
    // no waiting: the switch changes instantly, errors show if it fails
    updateDoc(doc(db, "products", p.id), { inStock: !(p.inStock !== false) }).catch((e) =>
      setErr(friendlyDbError(e))
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setErr("");
    deleteDoc(doc(db, "products", toDelete.id)).catch((e) => setErr(friendlyDbError(e)));
    setMsg("Product deleted 🗑️");
    setToDelete(null);
  };

  return (
    <main className="min-h-screen bg-ivory px-4 pb-20 pt-28 sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,97,0.18),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-gold-dark">
              Admin
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wider text-ink sm:text-4xl">
              Products
            </h1>
            <p className="mt-1 text-xs text-ink/50">{user?.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/add"
              className="rounded-full bg-linear-to-r from-gold-dark via-gold to-gold-light px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-[0_0_25px_rgba(201,169,97,0.4)] transition-transform hover:scale-105 active:scale-95"
            >
              + Add product
            </Link>
            <Link
              to="/"
              className="rounded-full border border-gold-dark/50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold-dark transition hover:bg-gold/20"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-ink/20 px-5 py-3 text-xs font-bold uppercase tracking-widest text-ink/70 transition hover:bg-ink/5"
            >
              Log out
            </button>
          </div>
        </div>

        {/* messages */}
        <AnimatePresence>
          {msg && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-xl border border-green-500/40 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {msg}
            </motion.p>
          )}
        </AnimatePresence>
        {(err || error) && (
          <p className="mt-6 rounded-xl border border-red-400/50 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err || error}
          </p>
        )}

        {/* section filter chips */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                filter === c.key
                  ? "border-ink bg-ink text-gold-light"
                  : "border-gold/40 bg-white text-ink/70 hover:border-gold-dark"
              }`}
            >
              <span aria-hidden="true">{c.emoji}</span>
              {c.label}
              <span className="rounded-full bg-gold/25 px-2 py-0.5 text-[10px] text-gold-dark">
                {counts[c.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* search */}
        <label className="relative mt-4 block max-w-md">
          <span className="sr-only">Search products</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-gold/40 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold-dark focus:ring-4 focus:ring-gold/20"
          />
        </label>

        {/* list */}
        <div className="mt-6 space-y-3">
          {loading &&
            [0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-gold/20 bg-white" />
            ))}

          {!loading && shown.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gold/50 bg-white/70 px-6 py-16 text-center">
              <p className="text-5xl">🛍️</p>
              <h2 className="mt-3 font-display text-xl font-bold text-gold-dark">
                {products.length === 0 ? "No products yet" : "Nothing found"}
              </h2>
              <p className="mt-1 text-sm text-ink/60">
                {products.length === 0
                  ? "Add your first product to get started."
                  : "Try another section or word."}
              </p>
              {products.length === 0 && (
                <Link
                  to="/admin/add"
                  className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold-light"
                >
                  + Add product
                </Link>
              )}
            </div>
          )}

          {shown.map((p) => {
            const sec = sectionOf(p.section);
            const inStock = p.inStock !== false;
            const d = Number(p.discount) || 0;

            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/30 bg-white p-3 shadow-[0_10px_30px_-20px_rgba(154,123,52,0.6)] sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  <SafeImage
                    src={optimizeImage(p.imageUrl, 200)}
                    alt={p.name}
                    className={`h-20 w-20 shrink-0 rounded-xl border border-gold/20 object-cover sm:h-24 sm:w-24 ${
                      inStock ? "" : "grayscale"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-ink">{p.name}</h3>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-gold-dark">
                        {sec ? `${sec.emoji} ${sec.label}` : p.section}
                      </span>
                      {d > 0 && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                          -{d}%
                        </span>
                      )}
                      {!inStock && (
                        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-white">
                          Sold out
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm">
                      <span className="font-bold text-gold-dark">
                        {formatMoney(finalPrice(p.price, d))}
                      </span>
                      {d > 0 && (
                        <span className="ml-2 text-xs text-ink/40 line-through">
                          {formatMoney(p.price)}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink/50">
                      {p.amazonLink ? "🛒 Amazon link added" : "No Amazon link"}
                    </p>
                  </div>
                </div>

                {/* actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gold/20 pt-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inStock}
                    onClick={() => toggleStock(p)}
                    className="flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:bg-gold/10 "
                  >
                    <span
                      className={`relative h-4 w-8 rounded-full transition-colors ${
                        inStock ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                          inStock ? "left-4" : "left-0.5"
                        }`}
                      />
                    </span>
                    {inStock ? "In stock" : "Sold out"}
                  </button>

                  <div className="ml-auto flex gap-2">
                    <Link
                      to={`/admin/edit/${p.id}`}
                      className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-light transition hover:opacity-85"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(p)}
                      className="rounded-full border border-red-400 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* delete confirm */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToDelete(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <p className="text-4xl">🗑️</p>
              <h2 className="mt-2 font-display text-xl font-bold text-ink">Delete this product?</h2>
              <p className="mt-2 text-sm text-ink/60">
                “{toDelete.name}” will be removed from the website. This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setToDelete(null)}
                  className="flex-1 rounded-full border border-ink/20 py-3 text-xs font-bold uppercase tracking-widest text-ink/70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 rounded-full bg-red-600 py-3 text-xs font-bold uppercase tracking-widest text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}