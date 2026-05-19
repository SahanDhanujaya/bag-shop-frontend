import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useLoader } from "../context/LoaderContext";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsLoading } = useLoader();
  const { checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await login({ email, password })
      .then(async (res: any) => {
        if (res.status === 200) {
          await checkAuth();
          navigate("/");
        }
      })
      .catch((err) => console.error("Login failed:", err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div
      className="flex items-center justify-center
                    min-h-[calc(100vh-4rem)] sm:min-h-[70vh]
                    py-6 sm:py-10 px-3 sm:px-6 bg-[#FAF8F5]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white
                   p-6 sm:p-8 md:p-10
                   rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem]
                   shadow-2xl shadow-rose-950/5
                   border border-rose-100
                   relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 sm:w-48 sm:h-48
                        bg-rose-200/30 rounded-full blur-3xl pointer-events-none"
        />
        <div
          className="absolute -bottom-16 -left-16 w-32 h-32
                        bg-rose-100/40 rounded-full blur-2xl pointer-events-none"
        />

        <div className="relative z-10">
          {/* ── Header ── */}
          <header className="mb-7 sm:mb-10 text-center">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="inline-flex p-3 sm:p-3.5 bg-rose-100 text-rose-500
                         rounded-xl sm:rounded-2xl mb-3 sm:mb-4"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>

            <h1
              className="text-2xl sm:text-3xl font-display font-black
                           tracking-tighter text-rose-950"
            >
              Welcome <span className="text-rose-500">Back</span>
            </h1>
            <p
              className="text-[10px] sm:text-xs font-bold text-rose-950/40
                           uppercase tracking-widest mt-1.5 sm:mt-2"
            >
              The studio awaits you
            </p>
          </header>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 lg:space-y-6"
          >
            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label
                className="text-[9px] sm:text-[10px] font-black uppercase
                                 tracking-[0.2em] text-rose-950/60 ml-1 block"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2
                                  w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                  group-focus-within:text-rose-500 transition-colors"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label
                  className="text-[9px] sm:text-[10px] font-black uppercase
                                   tracking-[0.2em] text-rose-950/60"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-[9px] sm:text-[10px] font-black uppercase
                             tracking-tighter text-rose-500
                             hover:text-rose-600 hover:underline transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2
                                  w-4 h-4 sm:w-5 sm:h-5 text-rose-300
                                  group-focus-within:text-rose-500 transition-colors"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-rose-50/50 border-2 border-transparent
                             focus:border-rose-200 focus:bg-white
                             p-3 sm:p-4 pl-10 sm:pl-12
                             rounded-xl sm:rounded-2xl outline-none transition-all
                             font-medium text-sm text-rose-950 placeholder-rose-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white
                         p-4 sm:p-5 rounded-xl sm:rounded-2xl
                         font-black text-xs sm:text-sm uppercase tracking-widest
                         shadow-xl shadow-rose-500/25
                         flex items-center justify-center gap-2
                         mt-2 transition-colors group active:scale-[0.99]"
            >
              Sign In
              <ArrowRight
                className="w-3.5 h-3.5 sm:w-4 sm:h-4
                                     transition-transform group-hover:translate-x-1"
              />
            </motion.button>
          </form>

          {/* ── Footer link ── */}
          <footer className="mt-6 sm:mt-8 text-center">
            <p className="text-[11px] sm:text-xs font-bold text-rose-950/40">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/user/register")}
                className="text-rose-500 hover:text-rose-600 hover:underline
                           font-black transition-colors"
              >
                Join the Studio
              </button>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
