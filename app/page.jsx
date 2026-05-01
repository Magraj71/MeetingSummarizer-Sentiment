"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Custom Components
const TestimonialCarousel = ({ testimonials, currentIndex, onIndexChange }) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        onIndexChange((prev) => (prev + 1) % testimonials.length);
      }, 6000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, testimonials.length, onIndexChange]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      <div className="text-center">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl md:text-6xl mb-6 text-[#d94a4a] opacity-50">“</div>
              <p className="text-lg md:text-xl lg:text-2xl text-[#2c2c2c] dark:text-white leading-relaxed italic max-w-3xl mx-auto">
                {currentTestimonial.text}
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d94a4a]/10 to-[#b83a3a]/5 flex items-center justify-center text-xl">
                  {currentTestimonial.avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#2c2c2c] dark:text-white">{currentTestimonial.name}</p>
                  <p className="text-sm text-[#999] dark:text-neutral-500">{currentTestimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlaying(false);
                onIndexChange(i);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`transition-all duration-300 ${
                i === currentIndex 
                  ? "w-8 h-2 bg-[#d94a4a]" 
                  : "w-2 h-2 bg-[#ddd] dark:bg-neutral-700 hover:bg-[#d94a4a]/50"
              } rounded-full`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="absolute top-0 right-0 text-xs text-[#999] hover:text-[#d94a4a] transition-colors"
        >
          {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group text-center p-6 rounded-2xl hover:bg-[#faf6f0] dark:hover:bg-neutral-900 transition-all duration-300 hover:shadow-md"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-[#d94a4a]/10 to-[#b83a3a]/5 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-semibold text-xl text-[#2c2c2c] dark:text-white mb-2">{title}</h3>
    <p className="text-[#777] dark:text-neutral-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const PricingCard = ({ plan, isPopular, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative rounded-2xl p-6 transition-all duration-300 ${
      isPopular 
        ? 'bg-white dark:bg-neutral-900 shadow-xl border-2 border-[#d94a4a] scale-105' 
        : 'bg-white dark:bg-neutral-900 shadow-sm border border-[#efe5db] dark:border-neutral-800 hover:shadow-md'
    }`}
  >
    {isPopular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="px-3 py-1 bg-[#d94a4a] text-white text-xs font-semibold rounded-full">
          Most Popular
        </span>
      </div>
    )}
    
    <div className="text-center mb-6">
      <h3 className="text-xl font-bold text-[#2c2c2c] dark:text-white mb-2">{plan.name}</h3>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-bold text-[#2c2c2c] dark:text-white">${plan.price}</span>
        <span className="text-[#999] dark:text-neutral-500">/{plan.period}</span>
      </div>
      <p className="text-sm text-[#666] dark:text-neutral-400 mt-2">{plan.description}</p>
    </div>
    
    <ul className="space-y-3 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-[#555] dark:text-neutral-300">
          <svg className="w-4 h-4 text-[#5a9e4e] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    
    <button
      onClick={onSelect}
      className={`w-full py-2.5 rounded-xl font-medium transition-all ${
        isPopular
          ? 'bg-[#d94a4a] text-white hover:bg-[#c13e3e] shadow-sm'
          : 'bg-white dark:bg-neutral-800 border border-[#e0d6cc] dark:border-neutral-700 text-[#2c2c2c] dark:text-white hover:bg-[#faf6f0] dark:hover:bg-neutral-700'
      }`}
    >
      Get Started
    </button>
  </motion.div>
);

const StatsCounter = ({ end, label, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );
    
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);
  
  return (
    <div ref={countRef} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-[#d94a4a]">{count.toLocaleString()}+</div>
      <div className="text-sm text-[#666] dark:text-neutral-400 mt-1">{label}</div>
    </div>
  );
};

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-[#e8e0d5] dark:border-neutral-800">
    <button
      onClick={onToggle}
      className="w-full py-4 flex justify-between items-center text-left hover:text-[#d94a4a] transition-colors"
    >
      <span className="font-medium text-[#2c2c2c] dark:text-white">{question}</span>
      <svg
        className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4 text-[#666] dark:text-neutral-400 text-sm leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const testimonials = [
    { text: "Meetlytics saved our team at least 5 hours a week. No more 'wait, what did we decide?' moments. The action item extraction is incredibly accurate.", name: "Sarah Chen", role: "Product Lead at TechCorp", avatar: "👩" },
    { text: "The sentiment analysis caught tension in our design review that I totally missed. Game changer for team dynamics and conflict resolution.", name: "Marcus Williams", role: "Design Director at CreativeStudio", avatar: "👨" },
    { text: "Finally, a meeting tool that actually helps instead of creating more work. Love how it integrates with our existing workflow.", name: "Jessica Park", role: "Engineering Manager at DevFlow", avatar: "👩‍💻" },
    { text: "The AI summaries are so good that team members actually read them. Our follow-up efficiency has doubled.", name: "David Kim", role: "CTO at InnovateLabs", avatar: "🧑" },
  ];

  const features = [
    { icon: "🎙️", title: "Record or paste", description: "Upload any audio/video file or paste your transcript. Works with all major formats." },
    { icon: "🧠", title: "AI analysis", description: "Our AI extracts decisions, action items, sentiment, and key takeaways automatically." },
    { icon: "📋", title: "Get insights", description: "Receive a shareable summary with sentiment scores and actionable insights in seconds." },
    { icon: "🤝", title: "Team collaboration", description: "Share summaries with your team and assign action items directly from the dashboard." },
    { icon: "🔒", title: "Privacy first", description: "Your data is encrypted and never used to train our models. Enterprise-grade security." },
    { icon: "⚡", title: "Real-time processing", description: "Get summaries instantly as meetings conclude. No waiting hours for results." },
  ];

  const pricingPlans = [
    { name: "Free", price: 0, period: "month", description: "Perfect for trying out", features: ["5 meetings/month", "30 min per meeting", "Basic analytics", "Email support"] },
    { name: "Pro", price: 29, period: "month", description: "For growing teams", features: ["Unlimited meetings", "2 hours per meeting", "Advanced analytics", "Priority support", "Team collaboration", "API access"] },
    { name: "Enterprise", price: 99, period: "month", description: "For large organizations", features: ["Everything in Pro", "Custom integrations", "SLA guarantee", "Dedicated support", "On-premise deployment", "SSO & SAML"] },
  ];

  const faqs = [
    { question: "How accurate is the transcription?", answer: "Our AI achieves over 95% accuracy for clear audio in English. It supports multiple accents and can handle moderate background noise. For best results, we recommend using a good quality microphone." },
    { question: "Is my data secure?", answer: "Yes, all data is encrypted at rest and in transit. We never use your meeting data to train our models unless you explicitly opt in. We're GDPR and CCPA compliant." },
    { question: "Which platforms are supported?", answer: "We support Google Meet, Zoom, Microsoft Teams, and any platform that allows audio recording. You can also upload MP3, WAV, MP4, and M4A files." },
    { question: "Can I try before buying?", answer: "Absolutely! We offer a 14-day free trial with full access to Pro features. No credit card required to start." },
    { question: "What languages are supported?", answer: "Currently we support English, Spanish, French, German, and Japanese. More languages coming soon!" },
    { question: "How does sentiment analysis work?", answer: "Our AI analyzes tone, word choice, and speaking patterns to detect sentiment across the conversation. It provides an overall score and highlights emotional moments." },
  ];

  const stats = [
    { value: 50000, label: "Meetings analyzed" },
    { value: 250000, label: "Action items created" },
    { value: 98, label: "Customer satisfaction" },
    { value: 15, label: "Hours saved per week" },
  ];

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

  const handlePlanSelect = (planName) => {
    setSelectedPlan(planName);
    // Redirect to signup with plan parameter
    window.location.href = `/signup?plan=${planName.toLowerCase()}`;
  };

  const handleWatchDemo = () => {
    // You can implement a video modal here
    alert("Demo video coming soon! Check back later.");
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <Navbar />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        
        {/* Hero section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#d94a4a]/10 px-3 py-1 rounded-full text-sm text-[#d94a4a] font-medium mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d94a4a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d94a4a]"></span>
                </span>
                ✨ New: Real-time Sentiment Analysis
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2c2c2c] dark:text-white leading-tight tracking-tight">
                Meetings should be
                <span className="text-[#d94a4a] block mt-2">conversations</span>
                <span className="block">not homework</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-[#686868] dark:text-neutral-400 mt-6 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Meetlytics listens, summarizes, and tells you how everyone really felt. 
                No more "can someone send notes?" in the group chat.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                <Link href="/signup">
                  <button className="px-6 sm:px-8 py-3 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-all shadow-sm hover:shadow-md active:scale-95">
                    Start free trial →
                  </button>
                </Link>
                <button onClick={handleWatchDemo} className="px-6 sm:px-8 py-3 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-[#555] dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                  Watch demo
                </button>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-8">
                <div className="flex -space-x-2">
                  {["👩", "👨", "👧", "🧑", "👴"].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border-2 border-[#f7f3ef] dark:border-neutral-950 flex items-center justify-center text-sm shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-[#777] dark:text-neutral-400">
                  <span className="font-semibold text-[#d94a4a]">2,500+</span> teams use Meetlytics daily
                </div>
              </motion.div>
            </div>

            {/* Right illustration - demo card */}
            <motion.div variants={itemVariants} className="flex-1 max-w-md w-full">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-[#efe5db] dark:border-neutral-800 hover:shadow-2xl transition-shadow">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#d94a4a]/60"></div>
                  <div className="w-3 h-3 rounded-full bg-[#e6a017]/60"></div>
                  <div className="w-3 h-3 rounded-full bg-[#5a9e4e]/60"></div>
                  <span className="text-xs text-[#999] dark:text-neutral-500 ml-2">meeting_transcript.txt</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Sarah:</span>
                    <span className="text-[#555] dark:text-neutral-300">I think we should focus on the mobile app first.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Marcus:</span>
                    <span className="text-[#555] dark:text-neutral-300">Good point. What about the timeline?</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-[#d94a4a]">Sarah:</span>
                    <span className="text-[#555] dark:text-neutral-300">Let's aim for end of April launch.</span>
                  </div>
                  <div className="bg-gradient-to-r from-[#fef8f0] to-white dark:from-neutral-800 dark:to-neutral-900 rounded-lg p-3 mt-3 border border-[#f0e4d0] dark:border-neutral-700">
                    <div className="flex items-center gap-2 text-xs text-[#d94a4a] mb-2">
                      <span>✨</span> AI Summary
                    </div>
                    <p className="text-xs text-[#555] dark:text-neutral-300">Team agreed to prioritize mobile app with target launch end of April. Sarah to create timeline.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-[#999] dark:text-neutral-500">
                    <span>Action items</span>
                    <span>2/4 completed</span>
                  </div>
                  <div className="h-1.5 bg-[#e8e0d5] dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-[#d94a4a] to-[#e6a017] rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats section */}
        <div className="bg-white dark:bg-neutral-900 border-y border-[#e8e0d5] dark:border-neutral-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <StatsCounter key={index} end={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>

        {/* Features section */}
        <div id="how-it-works" className="py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white mb-3">
                How it works
              </h2>
              <p className="text-base sm:text-lg text-[#777] dark:text-neutral-400 max-w-2xl mx-auto">
                Three simple steps to meeting clarity
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.slice(0, 3).map((feature, i) => (
                <FeatureCard key={i} {...feature} index={i} />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
              {features.slice(3, 6).map((feature, i) => (
                <FeatureCard key={i} {...feature} index={i + 3} />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="bg-white dark:bg-neutral-900 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-base sm:text-lg text-[#777] dark:text-neutral-400 max-w-2xl mx-auto">
                Choose the plan that works best for your team
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {pricingPlans.map((plan, index) => (
                <PricingCard
                  key={index}
                  plan={plan}
                  isPopular={plan.name === "Pro"}
                  onSelect={() => handlePlanSelect(plan.name)}
                />
              ))}
            </div>
            
            <p className="text-center text-sm text-[#999] dark:text-neutral-500 mt-8">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="py-16 sm:py-20 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white mb-3">
                Loved by teams worldwide
              </h2>
              <p className="text-base sm:text-lg text-[#777] dark:text-neutral-400">
                See what our customers are saying
              </p>
            </motion.div>
            
            <TestimonialCarousel 
              testimonials={testimonials}
              currentIndex={currentTestimonial}
              onIndexChange={setCurrentTestimonial}
            />
          </div>
        </div>

        {/* FAQ section */}
        <div className="bg-white dark:bg-neutral-900 py-16 sm:py-20 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white mb-3">
                Frequently asked questions
              </h2>
              <p className="text-base sm:text-lg text-[#777] dark:text-neutral-400">
                Everything you need to know about Meetlytics
              </p>
            </motion.div>
            
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#d94a4a] to-[#b83a3a] rounded-2xl sm:rounded-3xl py-12 sm:py-16 px-6 sm:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to transform your meetings?
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of teams who actually enjoy their meetings now
              </p>
              <Link href="/signup">
                <button className="px-6 sm:px-8 py-3 bg-white text-[#d94a4a] rounded-xl font-medium hover:bg-[#faf6f0] transition-all shadow-sm hover:shadow-md active:scale-95">
                  Start your free trial →
                </button>
              </Link>
              <p className="text-white/60 text-sm mt-4">
                No credit card required • 14-day trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}