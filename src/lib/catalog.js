// shared info about the 4 sections + price helpers

export const SECTIONS = [
  { key: "cosmetics", label: "Cosmetics", emoji: "💄", folder: "cosmetics" },
  { key: "fashions", label: "Fashions", emoji: "👗", folder: "fashions" },
  { key: "snacks", label: "Healthy Snacks", emoji: "🍪", folder: "snacks" },
  { key: "rc", label: "RC Cars", emoji: "🏎️", folder: "rc-cars" },
];

export const sectionOf = (key) => SECTIONS.find((s) => s.key === key);

export const CURRENCY = "₹";

// price after discount (discount is a percent, 0 to 100)
export function finalPrice(price, discount) {
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(discount) || 0, 0), 100);
  return Math.round(p * (1 - d / 100));
}

export function formatMoney(n) {
  return CURRENCY + Number(n || 0).toLocaleString("en-IN");
}

// simple words for Firebase errors
export function friendlyDbError(err) {
  const code = err?.code || "";
  if (code.includes("permission-denied"))
    return "Permission denied. Check your Firestore rules, and that your admin email is verified.";
  if (code.includes("unavailable") || code.includes("network"))
    return "No internet connection. Please try again.";
  if (code.includes("timeout"))
    return "Saving is taking too long. Check your internet, your .env project settings and your Firestore rules.";
  if (code.includes("unauthenticated"))
    return "You are not logged in. Please log out and log in again.";
  return `Something went wrong${code ? ` (${code})` : ""}. Please try again.`;
}