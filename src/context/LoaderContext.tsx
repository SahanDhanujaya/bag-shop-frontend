import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Adjusted to standard framer-motion import based on your admin view
import { BagShopping2 } from "@tailgrids/icons";

interface LoaderContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      
      {/* Global Loader Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-xl"
          >
            <div className="relative flex flex-col items-center">
              {/* Spinning Squircle */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  borderRadius: ["24px", "50%", "24px"] 
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-20 h-20 bg-rose-950 border-2 border-rose-500/20 shadow-2xl shadow-rose-950/40 flex items-center justify-center"
              >
                <BagShopping2 className="w-9 h-9 text-rose-50" />
              </motion.div>
              
              {/* Studio Text */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center space-y-1"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-950">
                  Preparing Textures
                </p>
                <p className="text-[9px] font-medium text-rose-500/60 uppercase tracking-[0.2em] italic">
                  Studio Command
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};