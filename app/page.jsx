"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { text: "Meetlytics saved our team at least 5 hours a week. No more 'wait, what did we decide?' moments.", name: "Sarah Chen", role: "Product Lead", avatar: "👩" },
    { text: "The sentiment analysis caught tension in our design review that I totally missed. Game changer.", name: "Marcus Williams", role: "Design Director", avatar: "👨" },
    { text: "Finally, a meeting tool that actually helps instead of creating more work. Love it.", name: "Jessica Park", role: "Engineering Manager", avatar: "👩‍💻" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef]">
      
      <Navbar />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        
        {/* Hero section */}
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div variants={itemVariants} className="inline-block bg-[#d94a4a]/10 px-3 py-1 rounded-full text-sm text-[#d94a4a] font-medium mb-5">
                ✨ New: Sentiment Analysis
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2c2c2c] leading-tight tracking-tight">
                Meetings should be
                <span className="text-[#d94a4a] block mt-2">conversations</span>
                <span className="block">not homework</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-[#686868] text-lg md:text-xl mt-6 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Meetlytics listens, summarizes, and tells you how everyone really felt. 
                No more "can someone send notes?" in the group chat.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                <Link href="/signup">
                  <button className="px-8 py-3.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors shadow-sm">
                    Start free trial →
                  </button>
                </Link>
                <Link href="#how-it-works">
                  <button className="px-8 py-3.5 border border-[#e0d6cc] rounded-xl text-[#555] hover:bg-white transition-colors">
                    Watch demo
                  </button>
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 justify-center lg:justify-start mt-8">
                <div className="flex -space-x-2">
                  {["👩", "👨", "👧", "🧑"].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-[#f7f3ef] flex items-center justify-center text-sm shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-[#777]">
                  <span className="font-semibold text-[#d94a4a]">2,000+</span> teams use Meetlytics daily
                </div>
              </motion.div>
            </div>

            {/* Right illustration - demo card */}
            <motion.div variants={itemVariants} className="flex-1 max-w-md w-full">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#efe5db]">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#d94a4a]/60"></div>
                  <div className="w-3 h-3 rounded-full bg-[#e6a017]/60"></div>
                  <div className="w-3 h-3 rounded-full bg-[#5a9e4e]/60"></div>
                  <span className="text-xs text-[#999] ml-2">meeting_transcript.txt</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Sarah:</span>
                    <span className="text-[#555]">I think we should focus on the mobile app first.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Marcus:</span>
                    <span className="text-[#555]">Good point. What about the timeline?</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Sarah:</span>
                    <span className="text-[#555]">Let's aim for end of April launch.</span>
                  </div>
                  <div className="bg-[#fef8f0] rounded-lg p-3 mt-3 border border-[#f0e4d0]">
                    <div className="flex items-center gap-2 text-xs text-[#d94a4a] mb-2">
                      <span>✨</span> AI Summary
                    </div>
                    <p className="text-xs text-[#555]">Team agreed to prioritize mobile app with target launch end of April.</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-[#e8e0d5] rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-[#d94a4a] to-[#e6a017] rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features section */}
        <div id="how-it-works" className="bg-white border-t border-[#e8e0d5] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#2c2c2c] mb-3">How it works</h2>
              <p className="text-[#777] max-w-2xl mx-auto">Three simple steps to meeting clarity</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", icon: "🎙️", title: "Record or paste", desc: "Upload a recording or paste your meeting transcript" },
                { step: "2", icon: "🧠", title: "AI analysis", desc: "We extract decisions, action items, and sentiment" },
                { step: "3", icon: "📋", title: "Get insights", desc: "Shareable summary ready in seconds" },
              ].map((feature, i) => (
                <motion.div key={i} variants={itemVariants} className="text-center p-6 rounded-2xl hover:bg-[#faf6f0] transition-colors">
                  <div className="w-16 h-16 bg-[#d94a4a]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xl text-[#2c2c2c] mb-2">{feature.title}</h3>
                  <p className="text-[#777] text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div variants={itemVariants}>
              <div className="text-5xl mb-4">“</div>
              <p className="text-xl md:text-2xl text-[#2c2c2c] leading-relaxed italic">
                {testimonials[currentTestimonial].text}
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-12 h-12 rounded-full bg-[#f0e6dc] flex items-center justify-center text-xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#2c2c2c]">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-[#999]">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentTestimonial ? "w-6 bg-[#d94a4a]" : "bg-[#ddd]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-[#d94a4a] mx-6 rounded-3xl py-16 mb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to transform your meetings?</h2>
            <p className="text-white/80 text-lg mb-8">Join thousands of teams who actually enjoy their meetings now</p>
            <Link href="/signup">
              <button className="px-8 py-3.5 bg-white text-[#d94a4a] rounded-xl font-medium hover:bg-[#faf6f0] transition-colors shadow-sm">
                Start your free trial →
              </button>
            </Link>
            <p className="text-white/60 text-sm mt-4">No credit card required • 14-day trial</p>
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}