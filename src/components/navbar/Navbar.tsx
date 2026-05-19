/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Scissors,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "@/src/context/LoaderContext";
import { nav } from "motion/react-client";

interface NavbarProps {
  setIsCartOpen: (open: boolean) => void;
}

export default function Navbar({ setIsCartOpen }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { setIsLoading } = useLoader();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const closeMobile = () => setIsMobileMenuOpen(false);

  console.log("result:", setIsCartOpen.toString());

  return (
    <>
      <nav className="sticky w-full top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-rose-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between h-16 sm:h-20 md:h-28 items-center">
            {/* ── Logo ── */}
            <Link
              to="/"
              onClick={closeMobile}
              className="flex items-center space-x-2.5 md:space-x-4 group z-50"
            >
              <motion.div
                whileHover={{ rotate: -10, scale: 1.05 }}
                className="bg-[#A3485E] p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl shadow-[#A3485E]/10"
              >
                <Scissors className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl md:text-3xl font-black tracking-[-0.07em] leading-none text-[#4A3538]">
                  SEW
                  <span className="font-light tracking-widest ml-1 text-[#C6A4A9]">
                    CREATIONS
                  </span>
                </span>
                <span className="text-[6px] sm:text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-[#A3485E]/70 mt-1">
                  Tailored Excellence
                </span>
              </div>
            </Link>

            {/* ── Right controls ── */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Desktop nav pills */}
              <div className="hidden md:flex items-center bg-[#FFF9FA] p-1.5 rounded-2xl border border-rose-100 gap-1">
                <Link
                  to="/"
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    location.pathname === "/"
                      ? "bg-white text-[#A3485E] shadow-sm"
                      : "text-[#C6A4A9] hover:text-[#A3485E]"
                  }`}
                >
                  Store
                </Link>
                {isAuthenticated && user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 ${
                      location.pathname.startsWith("/admin")
                        ? "bg-white text-[#A3485E] shadow-sm"
                        : "text-[#C6A4A9] hover:text-[#A3485E]"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                )}
              </div>

              {/* Cart button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsCartOpen(true);
                  if (location.pathname !== "/") navigate("/");
                }}
                className="relative bg-[#A3485E] h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14 flex items-center justify-center rounded-xl md:rounded-2xl shadow-xl shadow-[#A3485E]/10 cursor-pointer hover:bg-[#8C3B4E] transition-colors"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-[#E598A4] text-white text-[8px] md:text-[9px] w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full font-black border-2 border-white"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Desktop profile dropdown */}
              <div className="relative hidden md:block">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-14 w-14 bg-[#FFF9FA] border border-rose-100 flex items-center justify-center rounded-2xl hover:bg-[#FFEBEF] transition-colors cursor-pointer"
                >
                  {isAuthenticated ? (
                    <span className="text-md font-bold text-[#4A3538]">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-[#A3485E]" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-[0_20px_50px_rgba(163,72,94,0.1)] border border-rose-50 z-20 py-3 overflow-hidden"
                      >
                        {isAuthenticated ? (
                          <div className="px-5 py-2">
                            <p className="text-[9px] font-black text-[#C6A4A9] uppercase tracking-widest mb-1">
                              Account
                            </p>
                            <p className="text-xs font-bold truncate mb-3 text-[#4A3538]">
                              {user?.email}
                            </p>
                            <button
                              onClick={() => {
                                navigate("/user/profile");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left py-2 text-xs font-bold text-[#4A3538] hover:text-[#A3485E] hover:translate-x-1 transition-all"
                            >
                              Profile
                            </button>
                            {user?.role === "admin" && (
                              <button
                                onClick={() => {
                                  navigate("/admin");
                                  setIsProfileOpen(false);
                                }}
                                className="w-full text-left py-2 text-xs font-bold text-[#A3485E] hover:translate-x-1 transition-all"
                              >
                                Admin Management
                              </button>
                            )}
                            <button
                              onClick={() => {
                                logout();
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left py-2 mt-1 border-t border-rose-50 pt-2 text-xs font-bold text-red-400 hover:translate-x-1 transition-transform"
                            >
                              Logout
                            </button>
                          </div>
                        ) : (
                          <div className="px-5 py-1">
                            <button
                              onClick={() => {
                                navigate("/user/login");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left py-2 text-xs font-bold text-[#4A3538] hover:text-[#A3485E] hover:translate-x-1 transition-all tracking-widest uppercase"
                            >
                              Login
                            </button>
                            <button
                              onClick={() => {
                                navigate("/user/register");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left py-2 text-xs font-bold text-[#4A3538] hover:text-[#A3485E] hover:translate-x-1 transition-all tracking-widest uppercase"
                            >
                              Register
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden h-10 w-10 sm:h-11 sm:w-11 bg-[#FFF9FA] border border-rose-100 flex items-center justify-center rounded-xl text-[#A3485E] z-50 relative"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          Mobile Drawer + Backdrop — rendered OUTSIDE <nav> so the
          backdrop can cover the full viewport including the navbar
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 md:hidden
                         bg-rose-950/30 backdrop-blur-sm"
            />

            {/* ── Drawer panel ── */}
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              /* sits just below the sticky navbar (h-16 sm:h-20) */
              className="fixed top-16 sm:top-20 inset-x-0 z-[45] md:hidden
                         bg-white border-b border-rose-100
                         shadow-[0_20px_50px_rgba(163,72,94,0.12)]
                         overflow-hidden"
            >
              <div
                className="p-4 sm:p-5 flex flex-col gap-4 bg-[#FFF9FA]
                              max-h-[calc(100vh-5rem)] overflow-y-auto"
              >
                {/* Navigation links */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#C6A4A9] px-3">
                    Navigation
                  </span>
                  <Link
                    to="/"
                    onClick={closeMobile}
                    className={`w-full p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      location.pathname === "/"
                        ? "bg-[#A3485E] text-white"
                        : "bg-white text-[#4A3538] border border-rose-100/60 hover:border-[#A3485E]/30"
                    }`}
                  >
                    Browse Store
                  </Link>
                  {isAuthenticated && user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={closeMobile}
                      className={`w-full p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        location.pathname.startsWith("/admin")
                          ? "bg-[#A3485E] text-white"
                          : "bg-white text-[#4A3538] border border-rose-100/60 hover:border-[#A3485E]/30"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                </div>

                {/* User section */}
                <div className="border-t border-rose-100/60 pt-4 flex flex-col gap-2">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#C6A4A9] px-3">
                    User Space
                  </span>

                  {isAuthenticated ? (
                    <div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col gap-3">
                      {/* User identity row */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFF5F6] border border-rose-100 flex items-center justify-center font-bold text-sm text-[#A3485E] shrink-0">
                          {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#4A3538] truncate">
                            {user?.email}
                          </span>
                          <span className="text-[9px] font-medium text-[#C6A4A9]">
                            {user?.role === "admin"
                              ? "Store Administrator"
                              : "Authenticated Client"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-50">
                        <button
                          onClick={() => {
                            navigate("/user/profile");
                            closeMobile();
                          }}
                          className="p-2.5 bg-[#FFF5F6] hover:bg-[#FFEBEF] text-[#A3485E]
                                     rounded-xl text-center text-xs font-bold transition-colors
                                     active:scale-95"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            closeMobile();
                          }}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500
                                     rounded-xl text-center text-xs font-bold transition-colors
                                     flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/user/login"
                        onClick={closeMobile}
                        className="p-3 bg-white border border-rose-100 rounded-xl text-center
                                   text-xs font-black uppercase tracking-wider text-[#4A3538]
                                   hover:border-[#A3485E]/30 transition-colors active:scale-95"
                      >
                        Login
                      </Link>
                      <Link
                        to="/user/register"
                        onClick={closeMobile}
                        className="p-3 bg-[#A3485E] text-white rounded-xl text-center
                                   text-xs font-black uppercase tracking-wider shadow-sm
                                   hover:bg-[#8C3B4E] transition-colors active:scale-95"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
