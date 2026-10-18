import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logos/logo-main.png";

// turns Firebase error codes into simple words
function friendlyError(err) {
  const code = err?.code || "";
  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found") ||
    code.includes("invalid-email")
  )
    return "Email or password is not correct.";
  if (code.includes("too-many-requests"))
    return "Too many tries. Please wait a few minutes and try again.";
  if (code.includes("network"))
    return "No internet connection. Please check and try again.";
  if (code.includes("operation-not-allowed"))
    return "Email/Password sign-in is not turned on in Firebase yet.";
  return "Something went wrong. Please try again.";
}

const input =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-gold focus:ring-4 focus:ring-gold/20";
const goldBtn =
  "w-full rounded-full bg-linear-to-r from-gold-dark via-gold to-gold-light px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.25em] text-ink shadow-[0_0_30px_rgba(201,169,97,0.35)] transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60";
const ghostBtn =
  "w-full rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:bg-white/10 active:scale-95 disabled:opacity-60";

export default function AdminLogin() {
  const {
    user,
    loading,
    isAdmin,
    isAdminEmail,
    adminEmailSet,
    login,
    logout,
    resetPassword,
    resendVerification,
    refreshUser,
  } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0906]">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      </div>
    );
  }

  // already the real admin, go to the dashboard
  if (user && isAdmin) {
    return <Navigate to={location.state?.from?.pathname || "/admin"} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setInfo("");
    if (!email.trim()) {
      setError("Type your email above first, then tap Forgot password.");
      return;
    }
    setError("");
    try {
      await resetPassword(email.trim());
      setInfo("Password reset email sent. Check your inbox (and spam folder).");
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const sendVerify = async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await resendVerification();
      setInfo("Verification email sent. Open it, click the link, then come back here.");
    } catch (err) {
      setError(
        err?.code?.includes("too-many-requests")
          ? "Email already sent. Please wait a minute and check your inbox and spam."
          : friendlyError(err)
      );
    } finally {
      setBusy(false);
    }
  };

  const checkVerified = async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const ok = await refreshUser();
      if (!ok) setError("Not verified yet. Click the link in the email first.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  /* ----- which box to show ----- */
  let panel;

  if (user && !isAdminEmail) {
    // logged in, but this is not the admin account
    panel = (
      <div className="space-y-4 text-center">
        <p className="text-4xl">🚫</p>
        <h2 className="font-display text-xl font-bold text-gold-light">Not the admin account</h2>
        <p className="text-sm text-white/60">
          You are logged in as <strong className="text-white">{user.email}</strong>, but this
          account is not allowed here.
        </p>
        <button type="button" onClick={logout} className={ghostBtn}>
          Log out
        </button>
      </div>
    );
  } else if (user) {
    // admin email, but not verified yet
    panel = (
      <div className="space-y-4 text-center">
        <p className="text-4xl">📧</p>
        <h2 className="font-display text-xl font-bold text-gold-light">Verify your email</h2>
        <p className="text-sm text-white/60">
          For safety, your admin email <strong className="text-white">{user.email}</strong> must
          be verified once.
        </p>
        <ol className="space-y-1 text-left text-xs text-white/60">
          <li>1. Tap “Send verification email”.</li>
          <li>2. Open the email and click the link (check spam too).</li>
          <li>3. Come back here and tap “I verified”.</li>
        </ol>
        <button type="button" onClick={sendVerify} disabled={busy} className={goldBtn}>
          Send verification email
        </button>
        <button type="button" onClick={checkVerified} disabled={busy} className={ghostBtn}>
          I verified, continue
        </button>
        <button type="button" onClick={logout} className="text-xs text-white/40 underline">
          Log out
        </button>
      </div>
    );
  } else {
    // normal login form
    panel = (
      <form onSubmit={submit} className="space-y-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-gold-light">
            Admin login
          </h2>
          <p className="mt-1 text-xs text-white/50">Only the store owner can enter.</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gold/80">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={input}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gold/80">
            Password
          </span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${input} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gold"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button type="submit" disabled={busy} className={goldBtn}>
          {busy ? "Please wait..." : "Log in"}
        </button>

        <button
          type="button"
          onClick={forgot}
          className="block w-full text-center text-xs text-white/50 underline hover:text-gold"
        >
          Forgot password?
        </button>
      </form>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0906] px-4 pb-12 pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(201,169,97,0.22),transparent_60%)]" />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={logo}
          alt="Nxt Vibe"
          className="animate-float mx-auto -mb-6 h-24 w-24 object-contain drop-shadow-[0_0_25px_rgba(201,169,97,0.45)]"
        />

        <div className="rounded-3xl border border-gold/40 bg-black/60 p-6 pt-10 shadow-[0_30px_80px_-20px_rgba(201,169,97,0.25)] backdrop-blur sm:p-8 sm:pt-10">
          {!adminEmailSet && (
            <p className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
              ⚠️ <strong>VITE_ADMIN_EMAIL</strong> is missing in your .env file. Add it, then
              restart <code>npm run dev</code>.
            </p>
          )}

          {panel}

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-300">
              {info}
            </p>
          )}
        </div>
      </motion.div>
    </main>
  );
}