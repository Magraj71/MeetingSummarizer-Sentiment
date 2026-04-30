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

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { agreeTerms: false }
  });

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: data.fullName, email: data.email, password: data.password }),
      });
      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(result.message || "Something went wrong.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950 transition-colors">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="flex-1 space-y-7">
            <div>
              <div className="inline-block bg-[#d94a4a]/10 px-3 py-1 rounded-full text-sm text-[#d94a4a] font-medium mb-4">
                🚀 Join 2,000+ teams
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2c2c2c] dark:text-white leading-tight">
                Start actually <span className="text-[#d94a4a]">enjoying</span><br />your meetings
              </h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-7 shadow-md border border-[#efe5db] dark:border-neutral-800">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-[#2c2c2c] dark:text-white">Get started free</h2>
                <p className="text-[#777] dark:text-neutral-400 text-sm mt-1">No commitment, cancel anytime</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] dark:text-neutral-300 mb-1.5">Full name</label>
                  <input type="text" {...register("fullName")} className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all ${errors.fullName ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`} placeholder="Alex Rivera" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] dark:text-neutral-300 mb-1.5">Work email</label>
                  <input type="email" {...register("email")} className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all ${errors.email ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`} placeholder="alex@company.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] dark:text-neutral-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} {...register("password")} className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all pr-11 ${errors.password ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa]">
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] dark:text-neutral-300 mb-1.5">Confirm password</label>
                  <input type={showPassword ? "text" : "password"} {...register("confirmPassword")} className={`w-full px-4 py-3 rounded-xl border bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-[#e0d6cc] dark:border-neutral-800 focus:border-[#d94a4a]'}`} placeholder="••••••••" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" {...register("agreeTerms")} className="w-4 h-4 mt-0.5 rounded border-[#ccc] text-[#d94a4a]" />
                    <span className="text-sm text-[#666] dark:text-neutral-400 leading-tight">I agree to the Terms of Service</span>
                  </label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms.message}</p>}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#fef2f2] dark:bg-red-950/20 border border-[#fcd4d4] dark:border-red-900/50 rounded-xl p-3">
                      <p className="text-[#c73a3a] dark:text-red-400 text-sm text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={isLoading || isSuccess} className="w-full py-3 rounded-xl bg-[#d94a4a] text-white font-medium hover:bg-[#c13e3e] transition-colors disabled:opacity-60">
                  {isSuccess ? "✓ Account created! Redirecting..." : isLoading ? "Creating account..." : "Create free account →"}
                </button>

                <p className="text-center text-sm text-[#777] dark:text-neutral-400 pt-2">
                  Already have an account? <Link href="/login" className="text-[#d94a4a] hover:underline font-medium">Sign in instead</Link>
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

export default Signup;