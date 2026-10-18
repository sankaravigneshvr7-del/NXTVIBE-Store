// The WhatsApp number is NOT written in the code.
// It comes from the VITE_WHATSAPP_NUMBER variable:
//   - on your computer: in the .env file
//   - on Netlify: in Site configuration -> Environment variables
// Format: digits only, country code first, no + and no spaces.
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(
  /\D/g,
  ""
);

if (!WHATSAPP_NUMBER) {
  console.warn("VITE_WHATSAPP_NUMBER is missing. WhatsApp buttons will not work.");
}

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

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Builds the ready-to-send WhatsApp message for one product
export function orderLink(product) {
  const section = SECTION_NAMES[product.section] || product.section || "";

  const hasPrice = product.price !== undefined && product.price !== "";
  const discount = Math.min(Math.max(Number(product.discount) || 0, 0), 100);
  const original = Number(product.price) || 0;
  const final = Math.round(original * (1 - discount / 100));

  let priceLine = null;
  if (hasPrice) {
    priceLine =
      discount > 0
        ? `• Price: ${money(final)} (${discount}% off, was ${money(original)})`
        : `• Price: ${money(original)}`;
  }

  const lines = [
    "Hello Nxt Vibe! 👋",
    "I would like to order:",
    "",
    `• Product: ${product.name}`,
    section ? `• Section: ${section}` : null,
    priceLine,
    "",
    "Please confirm availability. Thank you!",
  ].filter((line) => line !== null);

  return whatsappLink(lines.join("\n"));
}