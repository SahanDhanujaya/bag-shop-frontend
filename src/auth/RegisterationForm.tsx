import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, MapPin, ArrowRight, ShoppingBag } from "lucide-react";
import { register } from "../services/authService";
import toast from "react-hot-toast";
import { useLoader } from "../context/LoaderContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
  });
  const { setIsLoading } = useLoader();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    await register(formData)
      .then((res) => {
        toast.success("Registration successful!");
        navigate("/user/login");
        res.json();
      })
      .catch(() => toast.error("Registration failed!"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[80vh]
                    py-6 sm:py-10 px-3 sm:px-6 bg-[#FAF8F5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white
                   p-6 sm:p-8 md:p-12
                   rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem]
                   shadow-2xl shadow-rose-950/5
                   border border-rose-100
                   relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -left-20 w-48 h-48 sm:w-64 sm:h-64
                        bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-32 h-32
                        bg-rose-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">

          {/* ── Header ── */}
          <header className="mb-7 sm:mb-10 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="inline-flex p-3 sm:p-3.5 bg-rose-100 text-rose-500
                         rounded-xl sm:rounded-2xl mb-3 sm:mb-4"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-display font-black
                           tracking-tighter text-rose-950">
              Join the <span className="text-rose-500">Studio</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-rose-950/40
                           uppercase tracking-widest mt-1.5 sm:mt-2">
              Create your customer account
            </p>
          </header>

          {/* ── Form ──
              Single column on mobile — 2-col on md+
              Full-span fields use md:col-span-2 only
          ── */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
          >

            {/* Full Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase
                                 tracking-[0.2em] text-rose-950/60 ml-1 block">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2
                                  w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                  group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300"
                  placeholder="Alex Corduroy"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase
                                 tracking-[0.2em] text-rose-950/60 ml-1 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2
                                  w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                  group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300"
                  placeholder="alex@studio.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password — full width */}
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase
                                 tracking-[0.2em] text-rose-950/60 ml-1 block">
                Secure Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2
                                  w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                  group-focus-within:text-rose-500 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Shipping Address — full width */}
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase
                                 tracking-[0.2em] text-rose-950/60 ml-1 block">
                Default Shipping Address
              </label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 sm:left-4 top-3.5 sm:top-4
                                    w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                    group-focus-within:text-rose-500 transition-colors" />
                <textarea
                  required
                  rows={3}
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300
                             resize-none"
                  placeholder="123 Texture Lane, Velvet City"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Submit — full width */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="md:col-span-2 bg-rose-500 hover:bg-rose-600 text-white
                         p-4 sm:p-5 rounded-xl sm:rounded-2xl
                         font-black text-xs sm:text-sm uppercase tracking-widest
                         shadow-xl shadow-rose-500/25
                         flex items-center justify-center gap-2
                         mt-2 sm:mt-4 transition-colors group active:scale-[0.99]"
            >
              Create Account
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4
                                     transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Sign-in link */}
            <p className="md:col-span-2 text-center text-[11px] sm:text-xs
                           font-bold text-rose-950/40 mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/user/login")}
                className="text-rose-500 hover:text-rose-600 hover:underline
                           font-black transition-colors"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;