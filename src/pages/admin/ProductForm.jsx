import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { cloudinaryReady, optimizeImage, uploadImage } from "../../lib/cloudinary";
import {
  SECTIONS,
  sectionOf,
  finalPrice,
  formatMoney,
  friendlyDbError,
} from "../../lib/catalog";
import SafeImage from "../../components/SafeImage";

const inputCls =
  "w-full rounded-xl border border-gold/40 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-ink/30 focus:border-gold-dark focus:ring-4 focus:ring-gold/20";

const EMPTY = {
  section: "cosmetics",
  name: "",
  price: "",
  discount: "",
  description: "",
  imageUrl: "",
  amazonLink: "",
  inStock: true,
};

function Field({ label, htmlFor, hint, children }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <div>
      <Tag
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gold-dark"
      >
        {label}
      </Tag>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // image upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // when editing, load the product
  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!alive) return;
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const d = snap.data();
          setForm({
            section: d.section || "cosmetics",
            name: d.name || "",
            price: d.price ?? "",
            discount: d.discount ?? "",
            description: d.description || "",
            imageUrl: d.imageUrl || "",
            amazonLink: d.amazonLink || "",
            inStock: d.inStock !== false,
          });
        }
      } catch (e) {
        if (alive) setError(friendlyDbError(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  /* ----- image ----- */
  const pickFile = async (file) => {
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("This image is too big. Please use one under 15 MB.");
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setProgress(0);
    setUploading(true);
    try {
      const folder = sectionOf(form.section)?.folder;
      const url = await uploadImage(file, folder, setProgress);
      set("imageUrl", url);
      setLocalPreview("");
    } catch (e) {
      setUploadError(e.message || "Upload failed. Please try again.");
      setLocalPreview("");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    set("imageUrl", "");
    setLocalPreview("");
    setUploadError("");
  };

  /* ----- save ----- */
  const validate = () => {
    if (!form.name.trim()) return "Please enter the product name.";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      return "Please enter a valid price.";
    const d = Number(form.discount || 0);
    if (isNaN(d) || d < 0 || d > 100) return "Discount must be between 0 and 100.";
    if (form.amazonLink.trim() && !/^https?:\/\//i.test(form.amazonLink.trim()))
      return "The Amazon link must start with http:// or https://";
    if (uploading) return "Please wait for the image to finish uploading.";
    return "";
  };

  const save = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setError("");

    const data = {
      section: form.section,
      name: form.name.trim(),
      price: Number(form.price),
      discount: Number(form.discount || 0),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      amazonLink: form.amazonLink.trim(),
      inStock: form.inStock,
    };

    const payload = isEdit
      ? { ...data, updatedAt: serverTimestamp() }
      : { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

    const op = isEdit
      ? updateDoc(doc(db, "products", id), payload)
      : addDoc(collection(db, "products"), payload);

    // wait for Firebase to really confirm (max 10 seconds)
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject({ code: "timeout" }), 10000)
    );

    try {
      await Promise.race([op, timeout]);
    } catch (err) {
      console.error("Save failed:", err);
      setError(friendlyDbError(err));
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/admin", {
      state: { msg: isEdit ? "Product updated ✅" : "Product added ✅" },
    });
  };

  /* ----- numbers for the live preview ----- */
  const priceNum = Number(form.price) || 0;
  const discNum = Math.min(Math.max(Number(form.discount) || 0, 0), 100);
  const final = finalPrice(priceNum, discNum);
  const previewSrc = localPreview || optimizeImage(form.imageUrl, 600);

  /* ----- loading / not found ----- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold-dark" />
      </div>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-4 pt-24 text-center">
        <div>
          <p className="text-5xl">🤔</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-gold-dark">
            Product not found
          </h1>
          <Link
            to="/admin"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold-light"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory px-4 pb-20 pt-28 sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,97,0.18),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/admin"
          className="text-xs font-bold uppercase tracking-widest text-gold-dark hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wider text-ink sm:text-4xl">
          {isEdit ? "Edit product" : "Add product"}
        </h1>

        {!cloudinaryReady && (
          <p className="mt-5 rounded-xl border border-yellow-500/50 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            ⚠️ Image upload is not ready. Add <strong>VITE_CLOUDINARY_CLOUD_NAME</strong> and{" "}
            <strong>VITE_CLOUDINARY_UPLOAD_PRESET</strong> to your .env file, then restart{" "}
            <code>npm run dev</code>. You can still paste an image link below.
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-xl border border-red-400/50 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
          {/* ===== FORM ===== */}
          <form
            onSubmit={save}
            className="space-y-6 rounded-3xl border border-gold/30 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(154,123,52,0.6)] sm:p-8"
          >
            {/* section */}
            <Field label="1. Which section?" hint="Choose this first. Your image goes into that folder.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => set("section", s.key)}
                    className={`rounded-xl border px-3 py-3 text-xs font-bold uppercase tracking-wider transition ${
                      form.section === s.key
                        ? "border-ink bg-ink text-gold-light shadow-lg"
                        : "border-gold/40 bg-white text-ink/70 hover:border-gold-dark"
                    }`}
                  >
                    <span className="block text-xl">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* image */}
            <Field label="2. Product image">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition ${
                  dragging ? "border-gold-dark bg-gold/20" : "border-gold/50 bg-ivory"
                }`}
              >
                {previewSrc ? (
                  <div className="relative">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className={`mx-auto max-h-72 w-full object-contain ${
                        uploading ? "opacity-40" : ""
                      }`}
                    />
                    {uploading && (
                      <div className="absolute inset-x-6 bottom-6">
                        <div className="h-2 overflow-hidden rounded-full bg-white/80">
                          <div
                            className="h-full rounded-full bg-gold-dark transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs font-semibold text-ink">
                          Uploading {progress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 px-4 py-12 text-center"
                  >
                    <span className="text-4xl">📷</span>
                    <span className="text-sm font-semibold text-ink">
                      Tap to choose an image
                    </span>
                    <span className="text-xs text-ink/50">or drag and drop it here</span>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>

              {previewSrc && !uploading && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full border border-gold-dark/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-dark hover:bg-gold/15"
                  >
                    Change image
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-full border border-red-400 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {uploadError}
                </p>
              )}

              <details className="mt-3 text-xs text-ink/60">
                <summary className="cursor-pointer font-semibold text-gold-dark">
                  Or paste an image link
                </summary>
                <input
                  value={form.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className={`${inputCls} mt-2`}
                />
              </details>
            </Field>

            {/* name */}
            <Field label="3. Product name" htmlFor="name">
              <input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Example: Rose Glow Face Cream"
                maxLength={80}
                className={inputCls}
              />
            </Field>

            {/* price + discount */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="4. Price (₹)" htmlFor="price" hint="The normal price, before discount.">
                <input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="999"
                  className={inputCls}
                />
              </Field>

              <Field label="5. Discount (%)" htmlFor="discount" hint="Leave empty for no discount.">
                <input
                  id="discount"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  value={form.discount}
                  onChange={(e) => set("discount", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[0, 5, 10, 20, 30, 50].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("discount", n === 0 ? "" : String(n))}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        discNum === n
                          ? "border-ink bg-ink text-gold-light"
                          : "border-gold/40 text-ink/60 hover:bg-gold/15"
                      }`}
                    >
                      {n === 0 ? "None" : `${n}%`}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {priceNum > 0 && (
              <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm text-ink">
                Customer pays <strong className="text-gold-dark">{formatMoney(final)}</strong>
                {discNum > 0 && (
                  <>
                    {" "}
                    <span className="text-ink/60">
                      (saves {formatMoney(priceNum - final)})
                    </span>
                  </>
                )}
              </p>
            )}

            {/* description */}
            <Field label="6. Description" htmlFor="desc" hint={`${form.description.length}/300`}>
              <textarea
                id="desc"
                rows={4}
                maxLength={300}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Write a short, nice description..."
                className={inputCls}
              />
            </Field>

            {/* amazon */}
            <Field
              label="7. Amazon affiliate link"
              htmlFor="amazon"
              hint="Paste your Amazon affiliate link. It powers the orange Amazon button."
            >
              <input
                id="amazon"
                type="url"
                value={form.amazonLink}
                onChange={(e) => set("amazonLink", e.target.value)}
                placeholder="https://amzn.to/..."
                className={inputCls}
              />
            </Field>

            {/* stock */}
            <button
              type="button"
              role="switch"
              aria-checked={form.inStock}
              onClick={() => set("inStock", !form.inStock)}
              className="flex w-full items-center justify-between rounded-xl border border-gold/40 px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {form.inStock ? "In stock" : "Sold out"}
                </span>
                <span className="text-xs text-ink/50">
                  {form.inStock
                    ? "Customers can order this product."
                    : "The WhatsApp button will be switched off."}
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.inStock ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.inStock ? "left-[1.4rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            {/* buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 rounded-full bg-linear-to-r from-gold-dark via-gold to-gold-light px-6 py-4 font-display text-xs font-bold uppercase tracking-[0.25em] text-ink shadow-[0_0_30px_rgba(201,169,97,0.4)] transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : uploading
                  ? "Uploading image..."
                  : isEdit
                  ? "Save changes"
                  : "Add product"}
              </button>
              <Link
                to="/admin"
                className="rounded-full border border-ink/20 px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-ink/70 hover:bg-ink/5"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* ===== LIVE PREVIEW ===== */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-dark">
              Live preview
            </p>
            <motion.div
              layout
              className="overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-[0_20px_50px_-25px_rgba(154,123,52,0.7)]"
            >
              <div className="relative aspect-square bg-gold-light/30">
                <SafeImage
                  src={previewSrc}
                  alt="Preview"
                  className={`h-full w-full object-cover ${form.inStock ? "" : "grayscale"}`}
                />
                {discNum > 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                    -{discNum}%
                  </span>
                )}
                {!form.inStock && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    Sold out
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 font-display font-semibold text-ink">
                  {form.name || "Product name"}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                  {form.description || "Your description will show here."}
                </p>
                <p className="mt-2">
                  <span className="text-lg font-semibold text-gold-dark">
                    {formatMoney(final)}
                  </span>
                  {discNum > 0 && (
                    <span className="ml-2 text-sm text-ink/40 line-through">
                      {formatMoney(priceNum)}
                    </span>
                  )}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="flex flex-1 items-center justify-center rounded-full bg-[#25D366] py-2 text-xs font-semibold text-white">
                    💬 WhatsApp
                  </span>
                  {form.amazonLink.trim() && (
                    <span className="flex flex-1 items-center justify-center rounded-full bg-[#FF9900] py-2 text-xs font-semibold text-black">
                      🛒 Amazon
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
            <p className="mt-2 text-xs text-ink/50">
              This is a simple preview. The real card on the website uses each section's style.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}