import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { Check, Search, Sparkles, ArrowRight } from "lucide-react";
import { Bag } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartModal from "../components/modals/CartModal";

export default function Store({
  isCartOpen,
  setIsCartOpen,
}: {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [orderStatus, setOrderStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Bags");

  const { user } = useAuth();
  const { cart, addToCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${BASE_URL}/api/bags`)
      .then((res) => res.json())
      .then((data) => setBags(data));
  }, []);

  const handleAddToCartClick = (bag: Bag) => {
    const bagId = bag._id || (bag as any).id;
    addToCart(bag);
    setAddedId(bagId);
    setTimeout(() => setAddedId(null), 2000);
  };

  const filteredBags = bags.filter((bag) => {
    const matchesSearch =
      bag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Bags" || bag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckoutSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderStatus("submitting");
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const order = {
      name: formData.get("name"),
      email: user?.email,
      address: formData.get("address"),
      cartItems: cart,
      total,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(order),
      });
      if (res.ok) {
        setOrderStatus("success");
        clearCart();
        setTimeout(() => {
          setOrderStatus("idle");
          setIsCartOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setOrderStatus("idle");
    }
  };

  const getPrimaryImage = (bag: Bag): string => {
    if (Array.isArray(bag.image)) return bag.image[0] ?? "";
    return (bag.image as string) ?? "";
  };

  const CATEGORIES = ["All Bags", "Classic", "Daily", "Limited", "Special"];

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">

      {/* ── Hero ── */}
      <section className="relative mx-3 mt-3 sm:mx-4 sm:mt-4 md:mx-6 lg:mx-8
                          h-[55vw] min-h-[260px] max-h-[90vh]
                          rounded-2xl sm:rounded-3xl md:rounded-[3rem] lg:rounded-[4rem]
                          overflow-hidden group shadow-xl">
        <img
          src="/uploads/blue-purple-paper-bags.jpg"
          alt="Collection"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Gradient — vertical on mobile (text bottom-anchored), horizontal on md+ */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-rose-950/85 via-rose-950/50 to-transparent" />

        <div className="absolute inset-0 flex items-end md:items-center p-5 sm:p-8 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md
                            px-3 py-1.5 rounded-full border border-white/20 mb-3 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300 shrink-0" />
              <span className="text-rose-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em]">
                New Season Drop
              </span>
            </div>

            {/* Headline — scales from compact mobile to grand desktop */}
            <h1 className="text-[2rem] leading-none sm:text-5xl md:text-6xl lg:text-8xl
                           font-black text-white mb-3 sm:mb-5 uppercase tracking-tighter">
              Authentic{" "}
              <span className="text-rose-200 italic font-serif normal-case font-normal block sm:inline">
                Rose Textures
              </span>
            </h1>

            {/* Subtext — hidden on very small screens to keep hero uncluttered */}
            <p className="hidden xs:block text-xs sm:text-base md:text-lg text-rose-100/80
                           font-medium mb-5 sm:mb-8 max-w-xs sm:max-w-sm leading-relaxed">
              Handcrafted corduroy pieces designed for the modern creative.
            </p>

            {/* CTA */}
            <button
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-rose-950 px-5 sm:px-7 py-2.5 sm:py-3.5
                         rounded-xl font-bold hover:bg-rose-100 transition-all
                         flex items-center gap-2 shadow-lg text-xs sm:text-sm
                         active:scale-95"
            >
              Explore Now <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Inventory Section ── */}
      <section
        id="products"
        className="max-w-7xl mx-auto mt-8 sm:mt-14 md:mt-20 lg:mt-24
                   px-3 sm:px-4 md:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10"
      >

        {/* ── Controls row: title + filters + search ── */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">

          {/* Left: heading + category pills */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl
                           font-black text-rose-950 tracking-tighter uppercase leading-none">
              The Inventory
            </h2>

            {/* Horizontally scrollable pill row — never wraps, no scrollbar shown */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px]
                              font-bold transition-all border whitespace-nowrap shrink-0
                              active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-rose-900 text-white border-rose-900 shadow-sm"
                      : "bg-white text-rose-700/70 border-rose-100 hover:border-rose-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search — full width on mobile, capped on lg+ */}
          <div className="relative w-full lg:max-w-sm xl:max-w-md shrink-0">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            <input
              type="text"
              placeholder="Search by texture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3.5
                         bg-white border border-rose-100 rounded-xl
                         focus:ring-4 focus:ring-rose-500/5 transition-all
                         outline-none text-xs sm:text-sm text-rose-950 placeholder-rose-300"
            />
          </div>
        </div>

        {/* ── Product Grid ──
            • 2 cols on mobile (compact cards)
            • 2 cols on sm (more padding/text)
            • 3 cols on md
            • 4 cols on lg+
        ── */}
        {filteredBags.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                          gap-3 sm:gap-5 md:gap-6 lg:gap-8">
            {filteredBags.map((bag, i) => {
              const currentId = bag._id || (bag as any).id;
              const isAdded   = addedId === currentId;

              return (
                <motion.div
                  key={currentId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl
                             p-2 sm:p-3
                             border border-rose-50/50
                             hover:shadow-xl transition-all
                             flex flex-col"
                >
                  {/* Clickable image + meta area */}
                  <div
                    onClick={() => navigate(`/product/${currentId}`)}
                    className="cursor-pointer flex-1 flex flex-col"
                  >
                    {/* Image — taller portrait ratio on mobile, slightly wider on sm+ */}
                    <div className="aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden
                                    mb-2 sm:mb-3 relative bg-rose-50/20">
                      <img
                        src={getPrimaryImage(bag)}
                        alt={bag.name}
                        className="w-full h-full object-cover
                                   group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Category badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/90 backdrop-blur px-1.5 sm:px-2
                                         py-0.5 rounded-md
                                         text-[7px] sm:text-[8px] font-black
                                         tracking-widest uppercase text-rose-800">
                          {bag.category}
                        </span>
                      </div>
                    </div>

                    {/* Text meta */}
                    <div className="px-0.5 sm:px-1 flex-1 flex flex-col justify-between pb-1 sm:pb-2">
                      <div>
                        <h3 className="font-bold text-[11px] sm:text-sm lg:text-base
                                       text-rose-950 group-hover:text-rose-700
                                       transition-colors line-clamp-1 leading-snug">
                          {bag.name}
                        </h3>
                        <span className="font-black text-xs sm:text-sm lg:text-base
                                         text-rose-600 block mt-0.5">
                          ${bag.price}
                        </span>
                        {/* Description only on sm+ — too tight in 2-col mobile grid */}
                        <p className="hidden sm:block text-rose-700/50 text-[10px] sm:text-xs
                                      line-clamp-1 italic mt-1">
                          "{bag.description}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <div className="px-0.5 sm:px-1 pb-0.5 sm:pb-1 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCartClick(bag);
                      }}
                      className={`w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl
                                  font-bold text-[8px] sm:text-[10px]
                                  uppercase tracking-widest transition-all
                                  active:scale-95 ${
                        isAdded
                          ? "bg-rose-600 text-white"
                          : "bg-rose-50/50 text-rose-900 hover:bg-rose-900 hover:text-white"
                      }`}
                    >
                      {isAdded ? (
                        <Check className="mx-auto w-3.5 h-3.5" />
                      ) : (
                        <>
                          {/* Shorter label on mobile 2-col grid */}
                          <span className="sm:hidden">Add +</span>
                          <span className="hidden sm:inline">Add To Cart +</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 sm:py-32 text-center bg-rose-50/20 rounded-2xl sm:rounded-3xl
                          border-2 border-dashed border-rose-100 px-4">
            <p className="text-rose-400 font-bold uppercase tracking-widest text-[11px] sm:text-sm">
              No matching pieces found
            </p>
          </div>
        )}
      </section>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        orderStatus={orderStatus}
        onSubmitCheckout={handleCheckoutSubmit}
        BASE_URL={BASE_URL}
      />
    </div>
  );
}