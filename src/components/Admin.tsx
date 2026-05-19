import { useState, useEffect, FormEvent, ChangeEvent, Fragment, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ClipboardList,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  TrendingUp,
  ShoppingBag,
  Clock,
  Upload,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Bag, Order } from "../types";

// ─── Multi-image helper types ──────────────────────────────────────────────
interface ImageEntry {
  file: File | null;
  previewUrl: string;
  isExisting: boolean;
}

// ─── Tiny drag-reorder hook ────────────────────────────────────────────────
function useDragReorder<T>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) {
  const dragIndex = useRef<number | null>(null);

  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(i, 0, moved);
    dragIndex.current = i;
    setItems(next);
  };
  const onDragEnd = () => { dragIndex.current = null; };

  return { onDragStart, onDragOver, onDragEnd };
}

// ─── Status color helper ───────────────────────────────────────────────────
const statusClass = (status: string) => {
  if (status === "delivered")  return "bg-rose-950/10 text-rose-950 border border-rose-950/20";
  if (status === "shipped")    return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
  if (status === "cancelled")  return "bg-red-500/10 text-red-600 border border-red-500/20";
  return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"bags" | "orders">("bags");
  const [bags, setBags] = useState<Bag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [images, setImages] = useState<ImageEntry[]>([]);
  const MAX_IMAGES = 5;

  const [bagSearchQuery, setBagSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  const { onDragStart, onDragOver, onDragEnd } = useDragReorder(images, setImages);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const bagsRes   = await fetch(`${BASE_URL}/api/bags`);
      const ordersRes = await fetch(`${BASE_URL}/api/orders/admin/all`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (bagsRes.ok)   setBags(await bagsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const openNewForm = () => { setEditingBag(null); setImages([]); setIsFormOpen(true); };

  const openEditForm = (bag: Bag) => {
    setEditingBag(bag);
    const existing: ImageEntry[] = (bag.image ?? []).map((src) => ({
      file: null,
      previewUrl: src,
      isExisting: true,
    }));
    setImages(existing);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBag(null);
    images.forEach((img) => { if (!img.isExisting) URL.revokeObjectURL(img.previewUrl); });
    setImages([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);
    const newEntries: ImageEntry[] = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (!removed.isExisting) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleBagSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { alert("Please add at least one image."); return; }

    setIsUploading(true);
    const form     = e.target as HTMLFormElement;
    const formData = new FormData(form);

    images.forEach(({ file }) => { if (file) formData.append("images", file); });
    const existingPaths = images.filter((img) => img.isExisting).map((img) => img.previewUrl);
    formData.append("existingImages", JSON.stringify(existingPaths));

    const method = editingBag ? "PUT" : "POST";
    const url    = editingBag
      ? `${BASE_URL}/api/bags/${(editingBag as any)._id || (editingBag as any).id}`
      : `${BASE_URL}/api/bags`;

    try {
      const response = await fetch(url, { method, credentials: "include", body: formData });
      if (response.ok) { closeForm(); fetchData(); }
      else { const errData = await response.json(); alert(`Error: ${errData.error}`); }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBag = async (id: string) => {
    if (confirm("Are you sure you want to delete this bag?")) {
      await fetch(`${BASE_URL}/api/bags/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      fetchData();
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`${BASE_URL}/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  const filteredBags = useMemo(
    () => bags.filter(
      (bag) =>
        bag.name.toLowerCase().includes(bagSearchQuery.toLowerCase()) ||
        bag.category.toLowerCase().includes(bagSearchQuery.toLowerCase())
    ),
    [bags, bagSearchQuery]
  );

  const filteredOrders = useMemo(
    () => orderStatusFilter === "all" ? orders : orders.filter((o) => o.status === orderStatusFilter),
    [orders, orderStatusFilter]
  );

  const totalPages      = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (orderCurrentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderCurrentPage]);

  useEffect(() => { setOrderCurrentPage(1); }, [orderStatusFilter]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-10 bg-rose-50/10 min-h-screen p-3 sm:p-4 lg:p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Admin Header & Stats ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-7 lg:p-10 border border-rose-100 shadow-xl shadow-rose-950/5">
        {/* Title row */}
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-rose-950 tracking-tighter uppercase leading-tight">
                Studio <span className="text-rose-500">Command</span>
              </h1>
              <p className="text-rose-950/40 mt-1 text-xs sm:text-sm font-medium italic hidden sm:block">
                "Precision in every stitch, excellence in every order."
              </p>
            </div>
            {/* Stats — inline on mobile, row on md+ */}
            <div className="flex gap-3 sm:gap-4 shrink-0">
              <div className="bg-rose-50 px-4 py-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex flex-col items-center justify-center min-w-[80px] sm:min-w-[110px] lg:min-w-[140px] border border-rose-100">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-rose-500 mb-1 sm:mb-2" />
                <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-rose-950/50">Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-display font-black text-rose-950">LKR.{totalRevenue}</p>
              </div>
              <div className="bg-rose-100/50 px-4 py-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex flex-col items-center justify-center min-w-[80px] sm:min-w-[110px] lg:min-w-[140px] border border-rose-200/50">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-rose-600 mb-1 sm:mb-2" />
                <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-rose-950/50">Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-display font-black text-rose-950">{orders.length}</p>
              </div>
            </div>
          </div>

          {/* Tab Switcher — full-width on mobile */}
          <div className="flex space-x-2 p-1.5 bg-rose-50/50 rounded-xl sm:rounded-2xl w-full sm:w-fit border border-rose-100">
            {(["bags", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-1 sm:flex-none items-center justify-center space-x-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all font-black text-xs sm:text-sm uppercase tracking-tighter ${
                  activeTab === tab
                    ? "bg-rose-950 text-white shadow-xl shadow-rose-950/20"
                    : "text-rose-950/40 hover:text-rose-950"
                }`}
              >
                {tab === "bags" ? <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span>{tab === "bags" ? "Vault" : "Ledger"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bags Tab ── */}
      {activeTab === "bags" ? (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:gap-4 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-950/5">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-display font-black text-rose-950 whitespace-nowrap">Inventory Status</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openNewForm}
                className="flex items-center justify-center space-x-2 sm:space-x-3 bg-rose-500 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-500/25 font-black text-xs sm:text-sm uppercase tracking-wider transition-colors"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Forge New Bag</span>
              </motion.button>
            </div>
            {/* Search — full width */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
              <input
                type="text"
                placeholder="Search by name or series..."
                value={bagSearchQuery}
                onChange={(e) => setBagSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold text-sm text-rose-950 placeholder-rose-300"
              />
            </div>
          </div>

          {/* Bag cards — 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredBags.map((bag) => (
              <div
                key={(bag as any)._id || (bag as any).id}
                className="group bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden border border-rose-100 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                <div className="h-44 sm:h-52 lg:h-56 overflow-hidden bg-rose-50/50 relative">
                  <img
                    src={bag.image[0]}
                    alt={bag.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {bag.image.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ImagePlus className="w-3 h-3" />
                      {bag.image.length}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-200">
                    {bag.category}
                  </div>
                </div>
                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-display font-black text-rose-950 leading-tight truncate">{bag.name}</h3>
                      <div className="flex items-center mt-1.5 text-xs font-bold text-rose-950/40">
                        <Package className="w-3 h-3 mr-1 text-rose-400 shrink-0" />
                        <span>Supply: {bag.quantity} units</span>
                      </div>
                    </div>
                    <span className="text-xl sm:text-2xl font-display font-black text-rose-500 shrink-0">LKR.{bag.price}</span>
                  </div>
                  <div className="flex justify-end space-x-2 sm:space-x-3 pt-4 sm:pt-6 border-t border-rose-50">
                    <button
                      onClick={() => openEditForm(bag)}
                      className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all active:scale-95"
                    >
                      <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => deleteBag((bag as any)._id || (bag as any).id)}
                      className="p-2.5 sm:p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBags.length === 0 && (
            <div className="p-12 sm:p-20 text-center text-rose-950/20 bg-white rounded-2xl sm:rounded-[2rem] border border-rose-100">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 mx-auto mb-3 sm:mb-4 text-rose-400" />
              <p className="font-display font-black text-lg sm:text-xl tracking-tighter uppercase">No matching artifacts found...</p>
            </div>
          )}
        </div>

      ) : (
        /* ── Orders Tab ── */
        <div className="space-y-4 sm:space-y-6">
          {/* Filter bar — scrollable pill row on mobile */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-950/5">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />
              <h2 className="text-lg sm:text-xl font-display font-black text-rose-950">Filter Ledgers</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                    orderStatusFilter === status
                      ? "bg-rose-950 text-white shadow-md shadow-rose-950/10"
                      : "bg-rose-50/50 text-rose-950/60 hover:bg-rose-100/60 active:bg-rose-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders — TABLE on md+, CARDS on mobile */}
          <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-950/5 overflow-hidden">

            {/* ── Mobile card list (hidden on md+) ── */}
            <div className="block md:hidden divide-y divide-rose-50">
              {paginatedOrders.length === 0 && (
                <div className="p-16 text-center text-rose-950/20">
                  <ClipboardList className="w-16 h-16 opacity-20 mx-auto mb-4 text-rose-400" />
                  <p className="font-display font-black text-xl tracking-tighter uppercase">No legends written yet...</p>
                </div>
              )}
              {paginatedOrders.map((order) => {
                const orderId = (order as any)._id || (order as any).id;
                const isOpen  = expandedOrder === orderId;
                return (
                  <div key={orderId} className="p-4">
                    {/* Card header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <span className="font-display font-black text-rose-500 text-sm">#{orderId?.slice(-4)}</span>
                        <p className="font-black text-rose-950 text-sm leading-tight mt-0.5 truncate">{order.name}</p>
                        <p className="text-xs text-rose-950/40 font-medium truncate">{order.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-display font-black text-rose-950 text-lg">LKR.{order.total}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Date + status change row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center text-rose-950/40 font-bold text-xs uppercase italic">
                        <Clock className="w-3 h-3 mr-1.5 text-rose-400" />
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => { e.stopPropagation(); updateOrderStatus(orderId, e.target.value); }}
                          className="bg-rose-50/50 border border-rose-100 rounded-xl text-[10px] font-black uppercase p-1.5 outline-none text-rose-950 cursor-pointer"
                        >
                          {["pending","processing","shipped","delivered","cancelled"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setExpandedOrder(isOpen ? null : orderId)}
                          className="p-1.5 bg-rose-50 rounded-lg text-rose-400 hover:bg-rose-100 transition-colors"
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded order items */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 bg-rose-50/30 rounded-2xl p-4 space-y-3 border border-rose-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-950/40">
                              Items ({order.cartItems.length})
                            </h4>
                            <div className="space-y-2">
                              {order.cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-100">
                                  <div className="flex items-center space-x-2 min-w-0">
                                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shrink-0">x{item.quantity}</span>
                                    <span className="font-bold text-rose-950 text-xs truncate">{item.name}</span>
                                  </div>
                                  <span className="text-rose-950/50 font-black text-xs shrink-0 ml-2">LKR.{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-rose-100">
                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-950/40">Shipping</span>
                              <p className="text-xs font-medium text-rose-950/70 mt-1 italic">"{order.address}"</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (hidden on mobile) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-rose-50/30 border-b border-rose-100">
                    {["Reference", "Ambassador", "Tribute", "Lifecycle", "Timeline", "Operation"].map((h) => (
                      <th key={h} className="px-5 lg:px-8 py-5 lg:py-6 font-display font-black text-rose-950/40 uppercase tracking-widest text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {paginatedOrders.map((order) => {
                    const orderId = (order as any)._id || (order as any).id;
                    const isOpen  = expandedOrder === orderId;
                    return (
                      <Fragment key={orderId}>
                        <tr
                          className="hover:bg-rose-50/20 transition-colors cursor-pointer"
                          onClick={() => setExpandedOrder(isOpen ? null : orderId)}
                        >
                          <td className="px-5 lg:px-8 py-5 lg:py-6">
                            <span className="font-display font-black text-rose-500">#{orderId?.slice(-4)}</span>
                          </td>
                          <td className="px-5 lg:px-8 py-5 lg:py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-rose-950">{order.name}</span>
                              <span className="text-xs text-rose-950/40 font-medium mt-0.5">{order.email}</span>
                            </div>
                          </td>
                          <td className="px-5 lg:px-8 py-5 lg:py-6">
                            <span className="font-display font-black text-rose-950 text-lg">LKR.{order.total}</span>
                          </td>
                          <td className="px-5 lg:px-8 py-5 lg:py-6">
                            <span className={`px-3 lg:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 lg:px-8 py-5 lg:py-6">
                            <div className="flex items-center text-rose-950/40 font-bold text-xs uppercase italic">
                              <Clock className="w-3 h-3 mr-2 text-rose-400" />
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-5 lg:px-8 py-5 lg:py-6" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(orderId, e.target.value)}
                              className="bg-rose-50/50 border-2 border-rose-100 rounded-xl text-[10px] font-black uppercase p-2 focus:border-rose-300 transition-all outline-none text-rose-950 cursor-pointer"
                            >
                              {["pending","processing","shipped","delivered","cancelled"].map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-rose-50/10">
                            <td colSpan={6} className="px-5 lg:px-8 py-4">
                              <div className="bg-white rounded-3xl p-5 lg:p-6 border border-rose-100 shadow-inner flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-950/40 mb-2">
                                  Order Items ({order.cartItems.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                                  {order.cartItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-rose-50/40 p-3 lg:p-4 rounded-2xl border border-rose-100">
                                      <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
                                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0">x{item.quantity}</span>
                                        <span className="font-bold text-rose-950 text-sm truncate">{item.name}</span>
                                      </div>
                                      <span className="text-rose-950/50 font-black text-xs shrink-0 ml-2">LKR.{item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-3 lg:pt-4 border-t border-rose-100">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-950/40">Shipping Destination</span>
                                  <p className="text-sm font-medium text-rose-950/70 mt-2 italic">"{order.address}"</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="p-20 lg:p-32 text-center text-rose-950/20">
                  <ClipboardList className="w-16 h-16 lg:w-24 lg:h-24 opacity-20 mx-auto mb-4 lg:mb-6 text-rose-400" />
                  <p className="font-display font-black text-xl lg:text-2xl tracking-tighter uppercase">No legends written yet...</p>
                </div>
              )}
            </div>

            {/* Pagination — shared */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 bg-rose-50/20 border-t border-rose-100">
                <span className="text-[10px] sm:text-xs font-bold text-rose-950/50 uppercase tracking-wider">
                  {((orderCurrentPage - 1) * ordersPerPage) + 1}–{Math.min(orderCurrentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length}
                </span>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <button
                    disabled={orderCurrentPage === 1}
                    onClick={() => setOrderCurrentPage((p) => p - 1)}
                    className="p-2 rounded-xl border border-rose-100 bg-white text-rose-950 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setOrderCurrentPage(n)}
                      className={`w-8 h-8 rounded-xl font-black text-xs transition-all active:scale-95 ${
                        orderCurrentPage === n
                          ? "bg-rose-950 text-white"
                          : "bg-white text-rose-950 border border-rose-100 hover:bg-rose-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={orderCurrentPage === totalPages}
                    onClick={() => setOrderCurrentPage((p) => p + 1)}
                    className="p-2 rounded-xl border border-rose-100 bg-white text-rose-950 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Add / Edit Bag Slider — FULL-SCREEN on mobile, panel on md+
      ══════════════════════════════════════════════════════════════════════ */}
      {isFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-rose-950/20 backdrop-blur-xl z-[100]"
            onClick={closeForm}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:max-w-lg bg-white z-[110] shadow-2xl flex flex-col md:rounded-l-[3rem] border-l border-rose-100"
          >
            {/* ── Slider Header ── */}
            <div className="flex justify-between items-center px-5 sm:px-8 lg:px-10 pt-safe-top pt-5 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 border-b border-rose-50 shrink-0">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-rose-950 tracking-tighter uppercase">
                {editingBag ? "Refine" : "Forge"}{" "}
                <span className="text-rose-500">Bag</span>
              </h2>
              <button
                onClick={closeForm}
                className="p-2.5 sm:p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors group active:scale-95"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 group-hover:text-rose-600" />
              </button>
            </div>

            {/* ── Scrollable Form Body ── */}
            <form
              onSubmit={handleBagSubmit}
              className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 pb-10 pt-4 sm:pt-6 space-y-6 sm:space-y-8"
            >

              {/* ── IMAGE UPLOAD SECTION ───────────────────────────────── */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                    Bag Images
                  </label>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    images.length >= MAX_IMAGES
                      ? "bg-rose-500/10 text-rose-500"
                      : "bg-rose-950/5 text-rose-950/40"
                  }`}>
                    {images.length} / {MAX_IMAGES}
                  </span>
                </div>

                {/* Thumbnails — 3 cols on mobile, maintain grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={(e) => onDragOver(e, idx)}
                        onDragEnd={onDragEnd}
                        className="relative group rounded-xl sm:rounded-2xl overflow-hidden border-2 border-rose-100 bg-rose-50 aspect-square cursor-grab active:cursor-grabbing"
                      >
                        <img
                          src={img.previewUrl}
                          alt={`Bag image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-2 h-2 fill-white" />
                            Primary
                          </div>
                        )}
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm p-1 rounded-lg">
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                        {/* Remove — always visible on touch devices */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute bottom-1.5 right-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 sm:p-1.5 rounded-lg hover:bg-red-600 active:scale-95"
                        >
                          <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 bg-black/40 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <label className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-6 sm:p-8 border-4 border-dashed rounded-2xl sm:rounded-[2rem] cursor-pointer transition-all group ${
                    images.length === 0
                      ? "border-rose-200 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 active:bg-rose-50/80"
                      : "border-rose-100 bg-rose-50/10 hover:border-rose-300 hover:bg-rose-50/30"
                  }`}>
                    <div className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                      images.length === 0
                        ? "w-14 h-14 sm:w-16 sm:h-16 bg-white shadow-sm border border-rose-100"
                        : "w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 border border-rose-100"
                    }`}>
                      <Upload className={`text-rose-500 ${images.length === 0 ? "w-6 h-6 sm:w-8 sm:h-8" : "w-4 h-4 sm:w-5 sm:h-5"}`} />
                    </div>
                    {images.length === 0 ? (
                      <>
                        <p className="text-xs sm:text-sm font-black text-rose-950/40 uppercase tracking-widest text-center">
                          Select Material Images
                        </p>
                        <p className="text-[10px] text-rose-400 font-bold text-center">
                          Up to {MAX_IMAGES} images · First is primary
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] font-black text-rose-950/40 uppercase tracking-widest">
                        Add more ({MAX_IMAGES - images.length} left)
                      </p>
                    )}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </label>
                )}

                {images.length > 1 && (
                  <p className="text-[10px] text-rose-400/80 font-bold text-center">
                    ↕ Drag to reorder · First image is primary
                  </p>
                )}
              </div>

              {/* ── Text Fields ── */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 sm:mb-3 ml-1">
                    Bag Moniker
                  </label>
                  <input
                    name="name"
                    defaultValue={editingBag?.name}
                    required
                    className="w-full p-3 sm:p-4 bg-rose-50/50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold text-rose-950 placeholder-rose-300 text-sm sm:text-base"
                    placeholder="E.g. The Midnight Corduroy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 sm:mb-3 ml-1">
                      Price (LKR)
                    </label>
                    <input
                      name="price"
                      type="number"
                      defaultValue={editingBag?.price}
                      required
                      className="w-full p-3 sm:p-4 bg-rose-50/50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold text-rose-950 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 sm:mb-3 ml-1">
                      Stock
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={editingBag?.quantity}
                      required
                      className="w-full p-3 sm:p-4 bg-rose-50/50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold text-rose-950 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 sm:mb-3 ml-1">
                    Guild Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingBag?.category}
                    className="w-full p-3 sm:p-4 bg-rose-50/50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold appearance-none text-rose-950 cursor-pointer text-sm sm:text-base"
                  >
                    <option value="Classic">Classic Series</option>
                    <option value="Daily">Daily Companion</option>
                    <option value="Limited">Limited Artefact</option>
                    <option value="Special">Special Stitch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 sm:mb-3 ml-1">
                    Description of craftsmanship
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingBag?.description}
                    required
                    rows={4}
                    className="w-full p-3 sm:p-4 bg-rose-50/50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-bold text-rose-950 placeholder-rose-300 resize-none text-sm sm:text-base"
                    placeholder="Tell the story of this piece..."
                  />
                </div>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isUploading || images.length === 0}
                className="w-full py-4 sm:py-5 bg-rose-500 text-white rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-lg uppercase tracking-wider hover:bg-rose-600 transition-all shadow-2xl shadow-rose-500/25 flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>
                  {isUploading
                    ? "Preparing Forge..."
                    : editingBag
                    ? "Update Piece"
                    : "Complete Forge"}
                </span>
              </button>

              {/* Extra bottom padding for iOS safe area */}
              <div className="h-safe-area-inset-bottom h-4" />
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
}