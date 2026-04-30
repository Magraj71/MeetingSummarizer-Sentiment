"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "./Navbar";
import Footer from "./Footer";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setError(result.message || "Invalid email or password.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Give it another shot?");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] dark:bg-neutral-950 transition-colors">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2c2c2c] dark:text-white leading-tight">
                Meeting notes that
                <span className="text-[#d94a4a]"> actually make sense</span>
              </h1>
              <p className="text-[#6b6b6b] dark:text-neutral-400 text-lg mt-4 leading-relaxed">
                Stop wasting hours reviewing meeting recordings. We pull out the key points, decisions, and — here's the real magic — how people actually felt about things.
              </p>
            </div>

            <div className="space-y-5 pt-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-[#efe5db] dark:border-neutral-800">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#f0e6dc] dark:bg-neutral-800 flex items-center justify-center text-xl">👩‍💼</div>
                  <div>
                    <p className="text-[#2c2c2c] dark:text-neutral-300 text-sm italic">"I used to dread going back through meeting notes. This thing actually gets what we talked about."</p>
                    <p className="text-xs text-[#888] dark:text-neutral-500 mt-2">— Sarah, Product Lead</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-7 shadow-md border border-[#efe5db] dark:border-neutral-800">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-[#2c2c2c] dark:text-white">Welcome back</h2>
                <p className="text-[#777] dark:text-neutral-400 text-sm mt-1">Sign in to see your meetings</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] dark:text-neutral-300 mb-1.5">Work email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all ${errors.email ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`}
                    placeholder="alex@yourcompany.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-[#2c2c2c] dark:text-neutral-300">Password</label>
                    <a href="#" className="text-xs text-[#d94a4a] hover:underline">Forgot?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all pr-11 ${errors.password ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666]"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#fef2f2] dark:bg-red-950/20 border border-[#fcd4d4] dark:border-red-900/50 rounded-xl p-3">
                      <p className="text-[#c73a3a] dark:text-red-400 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full py-3 rounded-xl bg-[#d94a4a] text-white font-medium hover:bg-[#c13e3e] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSuccess ? "✓ Signed in!" : isLoading ? "Just a sec..." : "Sign in →"}
                </button>

                <p className="text-center text-sm text-[#777] dark:text-neutral-400 pt-2">
                  New here? <Link href="/signup" className="text-[#d94a4a] hover:underline font-medium">Create an account</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;