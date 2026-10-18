import { motion } from "framer-motion";
import SafeImage from "./SafeImage";
import { orderLink } from "../lib/whatsapp";
import { optimizeImage } from "../lib/cloudinary";
import { finalPrice, formatMoney } from "../lib/catalog";

// one look for each section
const THEMES = {
  cosmetics: {
    card: "rounded-2xl border border-gold/40 bg-white hover:border-gold hover:shadow-[0_25px_50px_-20px_rgba(154,123,52,0.55)]",
    aspect: "aspect-square",
    imgBg: "bg-gold-light/30",
    name: "font-display font-semibold text-ink",
    price: "font-semibold text-gold-dark",
    desc: "text-ink/60",
  },
  fashions: {
    card: "rounded-xl border border-white/10 bg-[#0a1630] hover:border-gold/70 hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.9)]",
    aspect: "aspect-[3/4]",
    imgBg: "bg-black",
    name: "font-display font-semibold tracking-wide text-white",
    price: "font-semibold text-gold-light",
    desc: "text-white/60",
  },
  snacks: {
    card: "rounded-[2rem] border-2 border-orange-200 bg-white hover:border-orange-400 hover:shadow-[0_25px_50px_-20px_rgba(194,86,0,0.5)]",
    aspect: "aspect-square",
    imgBg: "bg-orange-100",
    name: "font-bold text-[#7b3100]",
    price: "font-bold text-orange-600",
    desc: "text-[#7b3100]/70",
  },
  rc: {
    card: "rounded-lg border border-orange-500/40 bg-neutral-950 hover:border-orange-500 hover:shadow-[0_25px_50px_-20px_rgba(255,122,0,0.5)]",
    aspect: "aspect-[4/3]",
    imgBg: "bg-black",
    name: "font-extrabold uppercase italic tracking-tight text-white",
    price: "font-extrabold text-orange-400",
    desc: "text-white/60",
  },
};

export default function ProductCard({ product, section = "cosmetics", index = 0 }) {
  const t = THEMES[section] || THEMES.cosmetics;
  const soldOut = product.inStock === false;
  const hasPrice = product.price !== undefined && product.price !== "";
  const discount = Number(product.discount) || 0;
  const final = finalPrice(product.price, discount);
  // the WhatsApp message carries the price the customer really pays
  const forMessage = {
    ...product,
    section: product.section || section,
    price: hasPrice ? final : product.price,
  };

  return (
    <motion.article
      className={`group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${t.card}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
    >
      {/* picture */}
      <div className={`relative overflow-hidden ${t.aspect} ${t.imgBg}`}>
        <SafeImage
          src={optimizeImage(product.imageUrl, 600)}
          alt={product.name}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            soldOut ? "grayscale" : ""
          }`}
        />
        {discount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Sold out
          </span>
        )}
        {/* shine that slides over the picture on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-1000 group-hover:left-full group-hover:opacity-100" />
      </div>

      {/* text + buttons */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className={`line-clamp-2 text-sm sm:text-base ${t.name}`}>
          {product.name}
        </h3>
        {product.description && (
          <p className={`mt-1 line-clamp-2 text-xs sm:text-sm ${t.desc}`}>
            {product.description}
          </p>
        )}
        {hasPrice && (
          <p className={`mt-2 text-base sm:text-lg ${t.price}`}>
            {formatMoney(final)}
            {discount > 0 && (
              <span className="ml-2 text-xs font-normal line-through opacity-50 sm:text-sm">
                {formatMoney(product.price)}
              </span>
            )}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
          {soldOut ? (
            <span className="flex flex-1 cursor-not-allowed items-center justify-center rounded-full bg-gray-400/40 px-3 py-2 text-xs font-semibold text-gray-500">
              Out of stock
            </span>
          ) : (
            <a
              href={orderLink(forMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 active:scale-95"
            >
              <span aria-hidden="true">💬</span> WhatsApp
            </a>
          )}
          {product.amazonLink && (
            <a
              href={product.amazonLink}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FF9900] px-3 py-2 text-xs font-semibold text-black transition hover:brightness-110 active:scale-95"
            >
              <span aria-hidden="true">🛒</span> Amazon
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}