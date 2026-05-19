/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from "react-router-dom";
import { ArrowUpRight, Scissors } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1214] text-[#F5EBEF] border-t border-zinc-900 pt-16 md:pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-zinc-800/60">
          
          {/* Brand Left Column */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-[#A3485E] p-2 rounded-xl">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-widest text-white">SEW CREATIONS</span>
            </div>
            <p className="text-xs text-[#C6A4A9] max-w-sm font-medium leading-relaxed">
              Crafting premium architectural wear and custom tailorments. Our virtual atelier brings slow fashion and master precision to modern spaces.
            </p>
            <div className="flex items-center space-x-2 bg-zinc-900/60 w-fit px-4 py-2 rounded-full border border-zinc-800">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">
                Atelier Live: Online & Open
              </span>
            </div>
          </div>

          {/* Quick Links Middle Column */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Studio</span>
              <Link to="/" className="text-xs font-bold text-[#C6A4A9] hover:text-white transition-colors">Store</Link>
              <Link to="/user/profile" className="text-xs font-bold text-[#C6A4A9] hover:text-white transition-colors">My Profile</Link>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Legal</span>
              <a href="#" className="text-xs font-bold text-[#C6A4A9] hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-xs font-bold text-[#C6A4A9] hover:text-white transition-colors">Terms</a>
            </div>
          </div>

          {/* Socials & Interactions Right Column */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Digital Spaces</span>
            <div className="flex flex-col space-y-1">
              {["Instagram", "Pinterest", "LinkedIn"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="group flex items-center justify-between py-2.5 border-b border-zinc-800/40 text-xs font-bold text-[#C6A4A9] hover:text-white transition-colors"
                >
                  <span>{platform}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#E598A4] transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar Details */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-zinc-900 gap-4">
          <p className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] uppercase text-center sm:text-left">
            © 2026 SEW CREATIONS LUXURY STUDIO
          </p>
          <p className="text-[9px] font-bold text-zinc-600 tracking-[0.1em] uppercase">
            All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}