/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, useNavigation } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Modular Components
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Store from "./components/Store";
import Admin from "./components/Admin";
import Login from "./auth/LoginForm";
import Register from "./auth/RegisterationForm";
import ProfilePage from "./components/ProfilePage";
import ProductDetail from "./components/ProductDetail";
import EditProfile from "./components/editprofile/EditProfile";

// ─── Page transition wrapper ──────────────────────────────────────────────────
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.99 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.01 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// ─── Route guards ─────────────────────────────────────────────────────────────

/** Redirects to /user/login if the user is not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth state to resolve before redirecting
  if (isLoading) return <CenteredSpinner />;
  if (!user) return <Navigate to="/user/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/** Redirects to / if the user is not an admin */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <CenteredSpinner />;
  if (!user) return <Navigate to="/user/login" state={{ from: location }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Redirects already-logged-in users away from auth pages */
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <CenteredSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── Shared loading spinner ───────────────────────────────────────────────────
function CenteredSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-900 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Loading...</p>
    </div>
  );
}

// ─── Main app shell ───────────────────────────────────────────────────────────
function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage =
    location.pathname === "/user/login" ||
    location.pathname === "/user/register";

  // ── Auth pages — full-screen centered layout ──────────────────────────────
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#FFF9FA] flex flex-col items-center justify-center p-4 sm:p-6">
        <motion.button
          whileHover={{ x: -8 }}
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#A3485E]/60 hover:text-[#A3485E] transition-all"
        >
          <MoveLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Back to Studio</span>
        </motion.button>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/user/login"
              element={
                <RedirectIfAuth>
                  <PageWrapper><Login /></PageWrapper>
                </RedirectIfAuth>
              }
            />
            <Route
              path="/user/register"
              element={
                <RedirectIfAuth>
                  <PageWrapper><Register /></PageWrapper>
                </RedirectIfAuth>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  // ── Main app — navbar + content + footer layout ───────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F6] text-[#4A3538] selection:bg-[#E598A4] selection:text-white">
      <Navbar setIsCartOpen={setIsCartOpen} />

      {/* Responsive horizontal padding — tight on mobile, generous on desktop */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-10 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Public ── */}
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Store isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
                </PageWrapper>
              }
            />
            <Route
              path="/product/:id"
              element={
                <PageWrapper><ProductDetail /></PageWrapper>
              }
            />

            {/* ── Authenticated users only ── */}
            <Route
              path="/user/profile"
              element={
                <RequireAuth>
                  <PageWrapper><ProfilePage /></PageWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/user/profile/edit"
              element={
                <RequireAuth>
                  <PageWrapper><EditProfile /></PageWrapper>
                </RequireAuth>
              }
            />

            {/* ── Admin only ── */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <PageWrapper><Admin /></PageWrapper>
                </RequireAdmin>
              }
            />

            {/* ── 404 fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster
            toastOptions={{
              style: {
                background: "#A3485E",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "16px 24px",
              },
            }}
            position="top-right"
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}