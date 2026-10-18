import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");

// EDIT THESE TEXTS ANYTIME: this is what Google shows for each page
const PAGES = {
  "/": {
    title: "Nxt Vibe Online Store | Cosmetics, Fashions, Snacks & RC Cars",
    description:
      "Shop Nxt Vibe: handmade cosmetics, stylish T-shirts and dresses, healthy snacks and RC cars. Order easily on WhatsApp or buy on Amazon.",
  },
  "/cosmetics": {
    crumb: "Cosmetics",
    title: "Handmade Cosmetics | Nature Touch Handmades by Nxt Vibe",
    description:
      "Explore handmade, nature-inspired cosmetics from Nature Touch Handmades by Nxt Vibe. Order on WhatsApp or buy on Amazon.",
  },
  "/fashions": {
    crumb: "Fashions",
    title: "T-Shirts & Dresses Online | Nxt Vibe Fashions",
    description:
      "Shop stylish T-shirts and dresses from Nxt Vibe Fashions. Bold street style looks, easy ordering on WhatsApp or Amazon.",
  },
  "/snacks": {
    crumb: "Healthy Snacks",
    title: "Healthy Snacks Online | Nxt Vibe Healthy Snacks",
    description:
      "Tasty healthy snacks from Nxt Vibe. Pick your favourite crunch and order on WhatsApp or buy on Amazon.",
  },
  "/rc-cars": {
    crumb: "RC Cars",
    title: "RC Cars, Trucks & Excavators | Nxt Vibe RC Cars",
    description:
      "Shop RC rock crawlers, monster trucks, dump trucks and excavators at Nxt Vibe RC Cars. Order on WhatsApp or buy on Amazon.",
  },
};

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data) {
  let el = document.getElementById("route-jsonld");
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "route-jsonld";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// put <RouteSeo /> once inside the router. It renders nothing on screen.
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

    // admin pages: never show in Google
    if (clean.startsWith("/admin")) {
      document.title = "Admin | Nxt Vibe";
      setMeta("name", "robots", "noindex, nofollow");
      setJsonLd(null);
      return;
    }

    const page = PAGES[clean] || PAGES["/"];
    const base = SITE_URL || window.location.origin;
    const url = base + (clean === "/" ? "/" : clean);

    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta("name", "robots", "index, follow, max-image-preview:large");
    setCanonical(url);
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.description);

    // breadcrumb (Home > Cosmetics) for the section pages
    if (page.crumb) {
      setJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base + "/" },
          { "@type": "ListItem", position: 2, name: page.crumb, item: url },
        ],
      });
    } else {
      setJsonLd(null);
    }
  }, [pathname]);

  return null;
}