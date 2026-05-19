/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock, Scissors, MapPin, Calendar, Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/orders/my-orders`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: "include"
        });
        const data = await response.json();
        const sortedData = data.sort((a: Order, b: Order) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setOrders(sortedData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [BASE_URL]);

  const processedOrders = useMemo(() => {
    let result = [...orders];

    if (isFilterApplied && (startDate || endDate)) {
      result = result.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return true;
      });
    } else {
      result = result.slice(0, 3);
    }

    return result;
  }, [orders, startDate, endDate, isFilterApplied]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate || endDate) setIsFilterApplied(true);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsFilterApplied(false);
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-rose-950 text-white border border-rose-950/20';
      case 'shipped':   return 'bg-rose-500 text-white shadow-sm shadow-rose-500/20';
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default:          return 'bg-amber-50 text-amber-800 border border-amber-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12 pb-16 sm:pb-24 px-3 sm:px-4 lg:px-6 bg-rose-50/10 min-h-screen pt-3 sm:pt-4">

      {/* ── Profile Header ── */}
      <section className="relative overflow-hidden bg-white p-6 sm:p-10 md:p-14 lg:p-16 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] border border-rose-100 shadow-2xl shadow-rose-950/5">
        <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:gap-8">

          {/* Top row: badge + edit button */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-rose-950/40">Client Profile</span>
            </div>
            <button
              onClick={() => navigate("/user/profile/edit")}
              className="px-4 sm:px-8 py-2.5 sm:py-4 bg-rose-950 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-900 transition-colors shadow-lg shadow-rose-950/20 whitespace-nowrap active:scale-95"
            >
              Edit Account
            </button>
          </div>

          {/* Name + email */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tighter text-rose-950 uppercase leading-none">
              Hello,{" "}
              <span className="text-rose-500 block sm:inline">{user?.name || 'Guest'}</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-rose-950/50 flex items-center gap-2 italic">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
              <span className="truncate">{user?.email || 'guest@studio.com'}</span>
            </p>
          </div>
        </div>

        {/* Decorative scissors — scaled down on mobile */}
        <Scissors className="absolute -bottom-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64 text-rose-100/30 -rotate-12 pointer-events-none" />
      </section>

      {/* ── Date Range Filter Panel ── */}
      <section className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-rose-100 shadow-xl shadow-rose-950/5">
        <form onSubmit={handleApplyFilter} className="flex flex-col gap-4 sm:gap-6">

          {/* Date inputs — always 2-col on sm+ */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5 sm:mb-2 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span className="hidden xs:inline">Archive </span>From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 sm:p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl focus:bg-white focus:border-rose-300 focus:outline-none font-bold text-[11px] sm:text-xs text-rose-950 transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5 sm:mb-2 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span className="hidden xs:inline">Archive </span>Until
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 sm:p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl focus:bg-white focus:border-rose-300 focus:outline-none font-bold text-[11px] sm:text-xs text-rose-950 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons — full width on mobile, auto on sm+ */}
          <div className="flex gap-2 sm:gap-3">
            {isFilterApplied && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Reset
              </button>
            )}
            <button
              type="submit"
              disabled={!startDate && !endDate}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-3 sm:py-3.5 bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/10 active:scale-95"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Filter Archives
            </button>
          </div>
        </form>
      </section>

      {/* ── Orders Tracking Section ── */}
      <section className="space-y-5 sm:space-y-6 lg:space-y-8">

        {/* Section header */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-rose-100 pb-4 sm:pb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-display font-black text-rose-950 tracking-tight flex items-center gap-2 sm:gap-4 uppercase">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5px] text-rose-500 shrink-0" />
            {isFilterApplied ? 'Filtered Documents' : 'Latest Commissions'}
          </h2>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-950/40 bg-white border border-rose-100 px-3 sm:px-4 py-1.5 rounded-full shadow-sm self-start xs:self-auto whitespace-nowrap">
            {processedOrders.length} of {orders.length}
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20 space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-950/40">Retrieving Vault Archive</p>
          </div>

        ) : processedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-24 bg-white rounded-2xl sm:rounded-3xl lg:rounded-[3rem] border border-rose-100 shadow-md"
          >
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-rose-200 mx-auto mb-3 sm:mb-4" />
            <p className="text-rose-950/50 font-medium italic text-sm sm:text-base px-4">No custom creations match your queries.</p>
            {!isFilterApplied && (
              <button className="mt-5 sm:mt-6 text-xs font-black uppercase tracking-widest text-rose-500 underline decoration-2 underline-offset-8 hover:text-rose-600 transition-colors">
                Start Blueprinting
              </button>
            )}
          </motion.div>

        ) : (
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {processedOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white border border-rose-100 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 hover:shadow-2xl hover:shadow-rose-950/5 transition-all duration-500"
                >
                  {/* ── Order header: ref + status ── */}
                  <div className="flex flex-wrap justify-between items-start mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-6">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-rose-950/40 uppercase font-black tracking-widest">Reference</p>
                      <p className="font-mono text-[10px] sm:text-xs font-bold bg-rose-50 border border-rose-100 px-2.5 sm:px-3 py-1 rounded-lg text-rose-950 truncate max-w-[160px] sm:max-w-none">
                        #{order._id?.slice(-12).toUpperCase()}
                      </p>
                    </div>
                    <div className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0 ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  {/* ── Tracking Bar ── */}
                  <div className="relative flex justify-between mb-8 sm:mb-10 lg:mb-12 px-2 sm:px-4 max-w-full sm:max-w-2xl mx-auto">
                    {/* Base track */}
                    <div className="absolute top-[18px] left-0 w-full h-[2px] bg-rose-50 z-0" />
                    {/* Progress fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: order.status === 'delivered' ? '100%'
                             : order.status === 'shipped'   ? '50%'
                             : '5%'
                      }}
                      className="absolute top-[18px] left-0 h-[2px] bg-rose-500 z-0 transition-all duration-1000"
                    />
                    <TrackingStep icon={<Clock />}       label="Placed"     active={true} />
                    <TrackingStep icon={<Truck />}       label="In Transit" active={['shipped', 'delivered'].includes(order.status)} />
                    <TrackingStep icon={<CheckCircle />} label="Received"   active={order.status === 'delivered'} />
                  </div>

                  {/* ── Items Detail ── */}
                  <div className="bg-rose-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 border border-rose-100/50">
                    {order.cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group/item gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white text-rose-950 rounded-lg sm:rounded-xl border border-rose-100 flex items-center justify-center font-black text-[10px] sm:text-xs shadow-sm shrink-0">
                            {item.quantity}x
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-rose-950/80 group-hover/item:text-rose-950 transition-colors truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-rose-950/70 italic shrink-0">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}

                    {/* Grand total */}
                    <div className="flex justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-rose-100 items-baseline gap-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-rose-950/40">Grand Tribute</span>
                      <span className="text-2xl sm:text-3xl font-display font-black tracking-tighter text-rose-950">
                        Rs. {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

const TrackingStep = ({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) => (
  <div className={`relative z-10 flex flex-col items-center gap-1.5 sm:gap-3 ${active ? 'text-rose-950' : 'text-rose-200'}`}>
    <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all duration-500 ${
      active
        ? 'bg-white border-rose-500 scale-110 shadow-md shadow-rose-500/10 text-rose-500'
        : 'bg-rose-50/50 border-rose-100/70'
    }`}>
      {React.cloneElement(icon as React.ReactElement, { size: 16, strokeWidth: 2.5 })}
    </div>
    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-center leading-tight">
      {label}
    </span>
  </div>
);

export default ProfilePage;