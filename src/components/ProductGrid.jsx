import useProducts from "../hooks/useProducts";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  section,
  theme = section,
  emptyTitle = "Products coming soon",
  emptyText = "We're adding new items. Please check back shortly.",
  accent = "#c9a24b",
  textClass = "text-[#3b2f1e]",
}) {
  const { products, loading, error, retry } = useProducts(section);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-black/5 bg-black/5"
          >
            <div className="aspect-square bg-black/10" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 rounded bg-black/10" />
              <div className="h-4 w-1/3 rounded bg-black/10" />
              <div className="h-10 rounded-full bg-black/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mx-auto max-w-md py-16 text-center ${textClass}`}>
        <p className="mb-4 text-lg">{error}</p>
        <button
          onClick={retry}
          style={{ backgroundColor: accent }}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-black"
        >
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`mx-auto max-w-md py-16 text-center ${textClass}`}>
        <h3 className="mb-2 font-['Cinzel'] text-2xl">{emptyTitle}</h3>
        <p className="opacity-70">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} section={theme} index={i} />
      ))}
    </div>
  );
}