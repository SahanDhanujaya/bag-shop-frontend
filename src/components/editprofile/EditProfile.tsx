/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Shield, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useLoader } from "@/src/context/LoaderContext";
import { getUserProfile } from "@/src/services/userService";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setIsLoading } = useLoader();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: "client",
  });

  useEffect(() => {
    setIsLoading(true);
    if (user) {
      setFormData({
        displayName: user.name || user.email?.split("@")[0] || "",
        email: user.email || "",
        role: user.role || "client",
      });
    }
    setIsLoading(false);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/api/users/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.displayName,
          email: formData.email,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile details");

      await getUserProfile();
      toast.success("Account profile updated successfully!", {
        icon: "✨",
        style: {
          background: "#FFF9FA",
          color: "#4A3538",
          border: "1px solid #FCE7F3",
        },
      });
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      /* Full viewport, centred — padding shrinks on mobile so the card
         gets as much space as possible without touching the edges */
      className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-7rem)] bg-[#FFF9FA] py-6 sm:py-10 lg:py-12 px-3 sm:px-6 lg:px-8 flex justify-center items-start"
    >
      <div className="max-w-xl w-full bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-[0_20px_50px_rgba(163,72,94,0.06)] border border-rose-100/70 p-5 sm:p-7 md:p-10 relative overflow-hidden">

        {/* Decorative top-right accent */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-rose-50/50 to-transparent rounded-bl-full pointer-events-none" />

        {/* ── Top nav row ── */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#C6A4A9] hover:text-[#A3485E] transition-colors group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#A3485E]/60 bg-[#FFF5F6] border border-rose-100/60 px-2.5 sm:px-3 py-1 rounded-full">
            Settings Panel
          </span>
        </div>

        {/* ── Section heading ── */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#4A3538]">
            Edit Account
          </h1>
          <p className="text-[11px] sm:text-xs text-[#C6A4A9] mt-1 sm:mt-1.5 font-medium leading-relaxed">
            Keep your profile details and preferences tailored up to date.
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          {/* Full Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#4A3538]/80 block px-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#C6A4A9]">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your customized display name"
                className="w-full py-3 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-[#FFF9FA] border border-rose-100/70 rounded-xl sm:rounded-2xl outline-none text-[11px] sm:text-xs font-bold text-[#4A3538] placeholder-rose-300 focus:border-[#A3485E] focus:bg-white focus:ring-4 focus:ring-[#A3485E]/5 transition-all"
              />
            </div>
          </div>

          {/* Email — locked */}
          <div className="space-y-1.5 sm:space-y-2 opacity-75">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#4A3538]/80 block">
                Email Address
              </label>
              <span className="text-[8px] font-bold text-[#C6A4A9] uppercase tracking-wider">
                System locked
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#C6A4A9]">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full py-3 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-gray-50/50 border border-rose-100/40 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-medium text-[#C6A4A9] cursor-not-allowed truncate"
              />
            </div>
          </div>

          {/* Role badge */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#4A3538]/80 block px-1">
              Assigned Permissions Role
            </label>
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-[#FFF5F6] border border-rose-100/50 rounded-xl sm:rounded-2xl">
              <div className="bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-sm text-[#A3485E] shrink-0 mt-0.5 sm:mt-0">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] sm:text-xs font-black capitalize tracking-wide text-[#4A3538]">
                  {formData.role}
                </span>
                <span className="text-[9px] sm:text-[9px] font-medium text-[#C6A4A9] mt-0.5 leading-relaxed">
                  {formData.role === "admin"
                    ? "Full store administrative management control authority status."
                    : "Standard client verification status access for order checkouts."}
                </span>
              </div>
            </div>
          </div>

          {/* Submit row */}
          <div className="pt-3 sm:pt-4 border-t border-rose-100/50 flex flex-col xs:flex-row justify-end gap-2">
            {/* Cancel — visible as a secondary option on mobile */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="xs:hidden w-full py-3 rounded-xl sm:rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#A3485E] bg-[#FFF5F6] border border-rose-100/60 active:scale-95 transition-all"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSaving}
              className="w-full xs:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#A3485E] text-white text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-[#A3485E]/10 hover:bg-[#8C3B4E] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}