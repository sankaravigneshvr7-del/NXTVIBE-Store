// Digits only, country code first, no + and no spaces.
// Example: 917305596991  (91 = India country code, then your 10-digit number)
// Reads VITE_WHATSAPP_NUMBER from .env, falls back to the number below.
export const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || "917305596991"
).replace(/\D/g, "");

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const SECTION_NAMES = {
  cosmetics: "Cosmetics",
  fashions: "Fashions",
  snacks: "Healthy Snacks",
  rc: "RC Cars",
  "rc-cars": "RC Cars",
};

// Builds the ready-to-send WhatsApp message for one product
export function orderLink(product) {
  const section = SECTION_NAMES[product.section] || product.section || "";
  const lines = [
    "Hello Nxt Vibe! 👋",
    "I would like to order:",
    "",
    `• Product: ${product.name}`,
    section ? `• Section: ${section}` : null,
    product.price !== undefined && product.price !== ""
      ? `• Price: ₹${product.price}`
      : null,
    "",
    "Please confirm availability. Thank you!",
  ].filter((line) => line !== null);

  return whatsappLink(lines.join("\n"));
}