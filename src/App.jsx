import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Cosmetics from "./pages/Cosmetics";
import Fashions from "./pages/Fashions";
import Snacks from "./pages/Snacks";
import RcCars from "./pages/RcCars";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductForm from "./pages/admin/ProductForm";
import RouteSeo from "./components/RouteSeo";

const SEEN_KEY = "nxtvibe_intro_seen";

// remember (for this browser tab) that the intro already played
function introAlreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

// scroll to the top whenever the page changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// navbar + pages + footer
function Shell() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <RouteSeo />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cosmetics" element={<Cosmetics />} />
        <Route path="/fashions" element={<Fashions />} />
        <Route path="/snacks" element={<Snacks />} />
        <Route path="/rc-cars" element={<RcCars />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </>
  );
}

export default function App() {
  // the gold intro plays only when someone lands on the home page,
  // and only once per visit. Other pages and admin pages open straight away.
  const [loading, setLoading] = useState(
    () => window.location.pathname === "/" && !introAlreadySeen()
  );
  const handleDone = useCallback(() => {
    markIntroSeen();
    setLoading(false);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence>
          {loading && <Loader key="loader" onDone={handleDone} />}
        </AnimatePresence>

        {!loading && <Shell />}
      </AuthProvider>
    </BrowserRouter>
  );
}