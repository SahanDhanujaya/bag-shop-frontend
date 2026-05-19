/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  MoveLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Truck,
  Check,
} from "lucide-react";
import { Bag } from "../types.ts";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bag, setBag] = useState<Bag | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  // BASE_URL is only used for API calls — NOT for image src (images are full URLs)
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setLoading(true);
    fetch(`${BASE_URL}/api/bags/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setBag(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!bag) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const bagId = bag._id || (bag as any).id;
    const existing = cart.find((item: any) => item.bagId === bagId);
    // images are already full URLs — use directly
    const images = Array.isArray(bag.image) ? bag.image : [bag.image];

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        bagId,
        name: bag.name,
        price: bag.price,
        quantity: 1,
        imageUrl: images[0], // full URL — no prefix needed
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-900 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
          Loading Masterpiece...
        </p>
      </div>
    );
  }

  if (!bag) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-rose-900 font-black text-xl mb-4">Piece Not Found</p>
        <button
          onClick={() => navigate("/")}
          className="text-xs font-black uppercase tracking-widest text-rose-400 hover:text-rose-900 flex items-center gap-2 mx-auto"
        >
          <MoveLeft className="w-4 h-4" /> Back to Inventory
        </button>
      </div>
    );
  }

  // images are full URLs e.g. "http://localhost:5000/uploads/img.jpg" — use as-is
  const images = Array.isArray(bag.image) ? bag.image : [bag.image];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-900/60 hover:text-rose-900 transition-colors"
      >
        <MoveLeft className="w-4 h-4" /> Back to Inventory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          {/* Thumbnail Strip */}
          <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none md:w-20 lg:w-24 shrink-0">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-16 h-20 md:w-full aspect-[4/5] rounded-xl overflow-hidden bg-white border shrink-0 transition-all ${
                  activeImageIndex === index
                    ? "border-rose-900 shadow-xs"
                    : "border-rose-100 opacity-60 hover:opacity-100"
                }`}
              >
                {/* ✅ img is already a full URL — no BASE_URL prefix */}
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Main Active Image */}
          <div className="order-1 md:order-2 flex-1 aspect-[4/5] bg-white rounded-2xl md:rounded-[2.5rem] p-2 md:p-3 border border-rose-50/50 shadow-xs overflow-hidden">
            <motion.div
              key={activeImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full rounded-xl md:rounded-[2rem] overflow-hidden bg-rose-50/20"
            >
              {/* ✅ images[activeImageIndex] is already a full URL — no BASE_URL prefix */}
              <img
                src={images[activeImageIndex]}
                alt={bag.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-rose-100 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-rose-900/80 text-[9px] font-black uppercase tracking-[0.2em]">
                {bag.category} Edition
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-rose-950 tracking-tight leading-tight uppercase">
              {bag.name}
            </h1>

            <p className="text-xl md:text-2xl font-black text-rose-600">
              Rs.{" "}
              {bag.price.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <hr className="border-rose-100/60" />

          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
              The Texture Story
            </h3>
            <p className="text-rose-900/80 text-sm leading-relaxed font-medium bg-white p-5 rounded-2xl border border-rose-50 shadow-xs italic">
              "{bag.description}"
            </p>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors shadow-xs flex items-center justify-center gap-3 ${
              isAdded
                ? "bg-rose-600 text-white"
                : "bg-rose-950 text-white hover:bg-rose-900"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" /> Secured in Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add To Studio Bag
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              {
                icon: Truck,
                label: "Complimentary Shipping",
                sub: "Sri Lanka Wide",
              },
              {
                icon: RefreshCw,
                label: "7-Day Return Matrix",
                sub: "Flawless Exchange",
              },
              {
                icon: ShieldCheck,
                label: "Authentic Tailoring",
                sub: "100% Secure Atelier",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/40 border border-rose-100/50 rounded-2xl p-3 flex flex-col items-center text-center shadow-2xs"
              >
                <item.icon className="w-4 h-4 text-rose-700/70 mb-1.5" />
                <span className="text-[9px] font-black text-rose-950 uppercase tracking-tight mb-0.5">
                  {item.label}
                </span>
                <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
