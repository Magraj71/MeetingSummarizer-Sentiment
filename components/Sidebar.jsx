"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📝", label: "Meetings", href: "/meetings" },
    { icon: "💬", label: "History", href: "/history" },
    { icon: "⚙️", label: "Settings", href: "/settings" },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside 
        initial={false}
        animate={{ width: isOpen ? 280 : 72 }}
        className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-[#e8e0d5] transition-all duration-300 ease-in-out shadow-sm ${
          isOpen ? "shadow-lg" : ""
        }`}
      >
        {/* Header - Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#efe5db]">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-base">M</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-[#2c2c2c]">Meetlytics</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-[#faf6f0] transition-colors text-[#888] hover:text-[#d94a4a]"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18L9 12L15 6" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18L15 12L9 6" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  active 
                    ? "bg-[#d94a4a]/10 text-[#d94a4a]" 
                    : "text-[#666] hover:bg-[#faf6f0] hover:text-[#2c2c2c]"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className={`text-sm font-medium whitespace-nowrap ${
                        active ? "text-[#d94a4a]" : ""
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - New Meeting button & User */}
        <div className="px-3 py-4 border-t border-[#efe5db] space-y-3">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-[#d94a4a] text-white hover:bg-[#c13e3e] transition-colors shadow-sm">
            <span>✨</span>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  New Meeting
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User profile - only when expanded */}
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-2 pt-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#f0e6dc] flex items-center justify-center text-base">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2c2c2c] truncate">Alex Rivera</p>
                  <p className="text-xs text-[#999] truncate">alex@meetlytics.com</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main content margin spacer */}
      <div style={{ marginLeft: isOpen ? 280 : 72 }} className="transition-all duration-300" />
    </>
  );
}