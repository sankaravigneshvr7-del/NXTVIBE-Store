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

// the admin email comes from your .env file
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

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
    !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL;
  const isAdmin = isAdminEmail && isVerified;

  const value = {
    user,
    loading,
    isAdmin,
    isAdminEmail,
    isVerified,
    adminEmailSet: !!ADMIN_EMAIL,
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