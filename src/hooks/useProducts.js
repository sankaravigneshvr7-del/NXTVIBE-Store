import { useCallback, useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

// loads products live from Firestore.
// useProducts()           -> all products
// useProducts("snacks")   -> only one section
// returns { products, loading, error, retry }
export function useProducts(section) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump this to reload

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const base = collection(db, "products");
    const q = section ? query(base, where("section", "==", section)) : base;

    const stop = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          // "estimate" gives a time right away for a product that was just added,
          // so it appears at the top instead of jumping to the bottom
          ...d.data({ serverTimestamps: "estimate" }),
        }));
        // newest first
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setProducts(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Could not load products.");
        setLoading(false);
      }
    );

    return stop;
  }, [section, attempt]);

  return { products, loading, error, retry };
}

export default useProducts;