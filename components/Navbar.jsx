"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, [pathname]); // Refetch when pathname changes to catch login/logout

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <div className="border-b border-[#e5dcd3] dark:border-neutral-800 bg-white/40 dark:bg-neutral-950/40 backdrop-blur-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <span className="font-bold text-xl text-[#2c2c2c] dark:text-white">Meetlytics</span>
              <span className="text-xs text-[#d94a4a] ml-2 bg-[#d94a4a]/10 px-2 py-0.5 rounded-full">beta</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center text-sm">
            {!user && (
              <>
                <Link href="/features" className="text-[#5a5a5a] dark:text-neutral-400 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">Features</Link>
                <Link href="/pricing" className="text-[#5a5a5a] dark:text-neutral-400 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">Pricing</Link>
              </>
            )}
            
            {user && (
              <Link href="/dashboard" className="text-[#5a5a5a] dark:text-neutral-400 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors font-medium">Dashboard</Link>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-neutral-600" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-neutral-400" style={{ marginTop: "-1.2rem" }} />
            </button>

            {!user ? (
              <>
                {pathname !== "/login" && (
                  <Link href="/login" className="text-[#5a5a5a] dark:text-neutral-400 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">Sign in</Link>
                )}
                {pathname !== "/signup" && (
                  <Link href="/signup" className="px-5 py-2 bg-[#d94a4a] text-white rounded-full hover:bg-[#c13e3e] transition-colors text-sm font-medium shadow-sm">
                    Get started
                  </Link>
                )}
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 cursor-pointer group p-1 pr-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white text-xs shadow-sm">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#2c2c2c] dark:text-white hidden lg:block">
                    {user.fullName}
                  </span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-[#efe5db] dark:border-neutral-800 overflow-hidden z-30"
                    >
                      <div className="px-4 py-3 border-b border-[#efe5db] dark:border-neutral-800">
                        <p className="text-sm font-semibold text-[#2c2c2c] dark:text-white">{user.fullName}</p>
                        <p className="text-xs text-[#999] dark:text-neutral-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[#666] dark:text-neutral-300 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">
                          <span>👤</span> Profile Settings
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-[#666] dark:text-neutral-300 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">
                          <span>📊</span> Dashboard
                        </Link>
                        <div className="border-t border-[#efe5db] dark:border-neutral-800 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[#d94a4a] hover:bg-[#faf6f0] dark:hover:bg-neutral-950 w-full text-left transition-colors"
                        >
                          <span>🚪</span> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-neutral-600" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-neutral-400" style={{ marginTop: "-1.25rem" }} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-neutral-950 border-b border-[#e5dcd3] dark:border-neutral-800 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-2">
              {!user ? (
                <>
                  <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2c2c2c] dark:text-white font-medium py-2">Features</Link>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2c2c2c] dark:text-white font-medium py-2">Pricing</Link>
                  <hr className="border-[#e5dcd3] dark:border-neutral-800 my-2" />
                  {pathname !== "/login" && (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2c2c2c] dark:text-white font-medium py-2">Sign in</Link>
                  )}
                  {pathname !== "/signup" && (
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-5 py-2.5 bg-[#d94a4a] text-white text-center rounded-xl font-medium shadow-sm mt-2">
                      Get started
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 py-3 border-b border-[#e5dcd3] dark:border-neutral-800 mb-2">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white shadow-sm">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#2c2c2c] dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-[#999] dark:text-neutral-400">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2c2c2c] dark:text-white font-medium py-2 flex items-center gap-2">📊 Dashboard</Link>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2c2c2c] dark:text-white font-medium py-2 flex items-center gap-2">👤 Profile Settings</Link>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-[#d94a4a] font-medium py-2 text-left flex items-center gap-2 mt-2">🚪 Sign out</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
}
