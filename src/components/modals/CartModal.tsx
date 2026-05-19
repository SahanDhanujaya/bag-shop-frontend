import React, { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X, ArrowRight, ShoppingBasket, Truck, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

interface CartModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orderStatus: "idle" | "submitting" | "success";
  onSubmitCheckout: (e: FormEvent<HTMLFormElement>) => void;
  BASE_URL: string;
}

export default function CartModal({
  isOpen,
  setIsOpen,
  orderStatus,
  onSubmitCheckout,
  BASE_URL,
}: CartModalProps) {
  const { cart, updateQuantity, clearCart, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 h-full bg-rose-950/30 backdrop-blur-sm z-[9998]"
          />

          {/* Premium Right Side Panel / Mobile Bottom Sheet */}
          <motion.div
            initial={{ x: "100%", y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%", y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 bottom-0 top-0 w-full md:w-[500px] bg-[#FAF8F5] z-[9999] shadow-2xl border-l border-rose-100 flex flex-col h-full overflow-hidden"
          >
            {/* Header section */}
            <div className="p-6 bg-white border-b border-rose-100/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-900">
                  <ShoppingBasket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-rose-950 text-base uppercase tracking-tight">Your Basket</h3>
                  <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} items selected
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-rose-300 hover:text-rose-950 hover:bg-rose-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Item List Box */}
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-rose-100/50 rounded-3xl p-6">
                    <div className="w-12 h-12 bg-rose-50/50 rounded-full flex items-center justify-center mb-3">
                      <ShoppingBasket className="w-6 h-6 text-rose-300" />
                    </div>
                    <p className="text-sm font-medium text-rose-950">Your basket is currently empty.</p>
                    <p className="text-xs text-rose-400 mt-1">Explore our catalog to add products.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-rose-100/60 rounded-3xl p-2 sm:p-4 divide-y divide-rose-50/60 shadow-sm">
                    <div className="flex justify-between items-center pb-3 px-2">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Selected Pieces</span>
                      <button
                        onClick={clearCart}
                        className="text-[10px] font-bold text-rose-900 hover:shadow rounded-lg p-2 uppercase tracking-widest transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    {cart.map((item) => (
                      <div key={item.bagId} className="flex gap-4 py-4 first:pt-3 last:pb-2 px-1 sm:px-2 group relative">
                        {/* Image Frame */}
                        <div className="w-20 h-24 bg-gradient-to-br from-rose-50/40 to-transparent rounded-2xl overflow-hidden flex-shrink-0 border border-rose-100/40 shadow-inner">
                          <img
                            src={`${BASE_URL}${item.imageUrl}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={item.name}
                          />
                        </div>

                        {/* Item Details Container */}
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-extrabold text-rose-950 text-sm leading-tight tracking-tight line-clamp-2">
                                {item.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.bagId, -item.quantity)}
                                className="p-1 text-rose-200 hover:text-rose-600 transition-colors flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] text-rose-400 font-bold uppercase tracking-wider">
                              <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md">Studio Piece</span>
                              <span className="flex items-center gap-0.5 text-emerald-600">
                                <Truck className="w-3 h-3" /> 3-Day Delivery
                              </span>
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex justify-between items-center mt-3">
                            <span className="font-black text-rose-950 text-sm sm:text-base">
                              Rs. {(item.price * item.quantity).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                            </span>
                            
                            <div className="flex items-center border border-rose-100 rounded-xl bg-white shadow-sm overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.bagId, -1)}
                                className="p-1.5 px-2.5 hover:bg-rose-50/50 text-rose-700 transition-colors border-r border-rose-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-black min-w-[32px] text-center text-rose-950">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.bagId, 1)}
                                className="p-1.5 px-2.5 hover:bg-rose-50/50 text-rose-700 transition-colors border-l border-rose-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Details Block */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] px-1 text-rose-400">
                  Price Breakdowns
                </h5>
                <div className="bg-white border border-rose-100/60 rounded-3xl p-5 space-y-3 shadow-sm text-xs">
                  <div className="flex justify-between font-semibold text-rose-700/80 uppercase tracking-wider">
                    <span>Items Subtotal</span>
                    <span className="text-rose-950 font-bold">
                      Rs. {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-rose-700/80 uppercase tracking-wider">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wide">Free Delivery</span>
                  </div>
                  <div className="pt-3 border-t border-rose-50 flex justify-between items-baseline">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Estimated Total</span>
                    <span className="text-2xl font-black text-rose-950">
                      Rs. {total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Form Layer */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] px-1 text-rose-400">
                    Shipping Assignment
                  </h5>
                  <form onSubmit={onSubmitCheckout} className="space-y-3 bg-white border border-rose-100/60 rounded-3xl p-5 shadow-sm">
                    <div>
                      <input
                        name="name"
                        type="text"
                        placeholder="Recipient Full Name"
                        required
                        className="w-full py-3 px-4 bg-[#FAF8F5]/60 border border-rose-100/70 focus:border-rose-300 rounded-2xl outline-none focus:ring-4 focus:ring-rose-900/5 text-xs transition-all text-rose-950 font-medium placeholder-rose-300"
                      />
                    </div>
                    <div>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Contact Phone Number"
                        required
                        className="w-full py-3 px-4 bg-[#FAF8F5]/60 border border-rose-100/70 focus:border-rose-300 rounded-2xl outline-none focus:ring-4 focus:ring-rose-900/5 text-xs transition-all text-rose-950 font-medium placeholder-rose-300"
                      />
                    </div>
                    <div>
                      <textarea
                        name="address"
                        placeholder="Complete Delivery Destination Address"
                        required
                        rows={3}
                        className="w-full py-3 px-4 bg-[#FAF8F5]/60 border border-rose-100/70 focus:border-rose-300 rounded-2xl outline-none focus:ring-4 focus:ring-rose-900/5 text-xs transition-all text-rose-950 font-medium placeholder-rose-300 resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      {!isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/user/login");
                          }}
                          className="w-full py-4 bg-rose-900 text-white rounded-2xl font-extrabold uppercase text-[11px] tracking-widest hover:bg-rose-950 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          Sign In to Place Order
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={orderStatus === "submitting"}
                          className="w-full py-4 bg-rose-950 text-white rounded-2xl font-extrabold uppercase text-[11px] tracking-widest hover:bg-rose-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          {orderStatus === "submitting" ? "Securing Order..." : "Confirm & Place Order"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Premium Guarantee Footer */}
            <div className="p-4 bg-white border-t border-rose-100/60 flex items-center justify-center gap-6 text-[10px] font-bold text-rose-400 uppercase tracking-wider flex-shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure SSL Checkout
              </span>
              <span>•</span>
              <span>Original Craftwork</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}