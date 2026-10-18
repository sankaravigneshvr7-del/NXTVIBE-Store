import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

// the admin emails come from your .env file.
// One email, or several separated by commas:
// VITE_ADMIN_EMAIL=owner@gmail.com,developer@gmail.com
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0); // used to refresh the screen after email verification

  // Firebase tells us whenever someone logs in or out
  useEffect(() => {
    const stop = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return stop;
  }, []);

    // "session" means: the login lasts only while this tab is open.
  // Close the tab or browser and you must log in again.
  const login = async (email, password) => {
    await setPersistence(auth, browserSessionPersistence);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const resendVerification = () => sendEmailVerification(auth.currentUser);

  // after you click the link in the email, call this to update the status
  const refreshUser = async () => {
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true); // new token so Firestore rules see "verified"
    setUser(auth.currentUser);
    setTick((n) => n + 1);
    return auth.currentUser.emailVerified;
  };

  const isVerified = !!user?.emailVerified;
  const isAdminEmail =
    !!user && !!user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const isAdmin = isAdminEmail && isVerified;

  const value = {
    user,
    loading,
    isAdmin,
    isAdminEmail,
    isVerified,
    adminEmailSet: ADMIN_EMAILS.length > 0,
    login,
    logout,
    resetPassword,
    resendVerification,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}