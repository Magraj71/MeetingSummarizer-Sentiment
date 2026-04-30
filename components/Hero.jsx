"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Hero() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Demo transcript examples - human touch
  const demoTranscripts = [
    "Sarah: I think we should push the launch to June. The design team needs more time for QA.\n\nMarcus: I hear you, but marketing already booked campaigns for May. Can we compromise on mid-May?\n\nSarah: Let me check with the team. What if we soft-launch in May and go full in June?\n\nMarcus: That could work. Let's get everyone aligned by Friday.",
    "Jessica: Budget is tight this quarter. We might need to cut some features.\n\nAlex: What if we prioritize the core AI features and push the advanced analytics to Q3?\n\nJessica: Makes sense. The AI stuff is what customers actually want.",
    "Product review meeting: \n- Mobile app needs better onboarding\n- Customer churn down 15% 🎉\n- Feature X still buggy, needs more testing\n- Next milestone: April 30th"
  ];

  const [currentDemo, setCurrentDemo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!transcript && !showDemo) {
        setCurrentDemo((prev) => (prev + 1) % demoTranscripts.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [transcript, showDemo]);

  const handleDemoClick = () => {
    setTranscript(demoTranscripts[currentDemo]);
    setShowDemo(true);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      alert("Paste a meeting transcript or click 'Try a demo' first!");
      return;
    }
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("✨ Analysis complete! Check the dashboard for your meeting summary.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef]">
      
      {/* Header */}
      <div className="border-b border-[#e5dcd3] bg-white/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <span className="font-bold text-xl text-[#2c2c2c]">Meetlytics</span>
              <span className="text-xs text-[#d94a4a] ml-2 bg-[#d94a4a]/10 px-2 py-0.5 rounded-full">beta</span>
            </div>
          </div>
          <div className="flex gap-5 text-sm">
            <a href="#" className="text-[#d94a4a] font-medium">Home</a>
            <a href="/login" className="text-[#5a5a5a] hover:text-[#d94a4a] transition-colors">Sign in</a>
            <a href="/signup" className="hidden sm:block text-[#5a5a5a] hover:text-[#d94a4a] transition-colors">Sign up</a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left column - Hero text */}
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-[#d94a4a]/10 px-3 py-1 rounded-full text-sm text-[#d94a4a] font-medium mb-2">
              ✨ New: Sentiment analysis + smart summaries
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2c2c2c] leading-tight tracking-tight">
              Stop taking notes.
              <span className="text-[#d94a4a] block mt-2">Start understanding.</span>
            </h1>
            
            <p className="text-[#686868] text-lg leading-relaxed">
              Meetlytics listens to your conversations and tells you what matters — 
              key decisions, action items, and how people really felt. No more 
              "wait, what did we agree on?"
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="/signup" 
                className="px-6 py-3 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors shadow-sm"
              >
                Start free trial →
              </a>
              <a 
                href="#demo" 
                className="px-6 py-3 border border-[#e0d6cc] rounded-xl text-[#555] hover:bg-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Watch demo
              </a>
            </div>

            {/* Social proof - human element */}
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-2">
                {["👩", "👨", "👧", "🧑", "👩‍🦰"].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-[#f7f3ef] flex items-center justify-center text-sm shadow-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-sm text-[#777]">
                <span className="font-semibold text-[#d94a4a]">2,000+</span> teams already use Meetlytics
              </div>
            </div>
          </div>

          {/* Right column - Interactive demo box */}
          <div id="demo-section" className="flex-1 w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#efe5db]">
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎙️</span>
                  <h3 className="font-semibold text-[#2c2c2c]">Try it yourself</h3>
                </div>
                <button
                  onClick={handleDemoClick}
                  className="text-xs text-[#d94a4a] hover:underline px-3 py-1.5 rounded-full bg-[#d94a4a]/5"
                >
                  Try a demo
                </button>
              </div>
              
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your meeting transcript here... or click 'Try a demo' to see it in action"
                className="w-full h-52 rounded-xl border border-[#e0d6cc] bg-[#fefcf9] p-4 text-sm text-[#555] focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all resize-none"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 py-2.5 rounded-xl bg-[#d94a4a] text-white font-medium hover:bg-[#c13e3e] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      ✨ Summarize meeting
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-[#999] text-center mt-4">
                No signup needed • Your data stays private
              </p>
            </div>
          </div>
        </div>

        {/* Features section - human and relatable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 pt-8 border-t border-[#e8e0d5]">
          <div className="text-center md:text-left">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-[#2c2c2c] mb-1">Lightning fast</h3>
            <p className="text-sm text-[#777]">Summaries in under 10 seconds. Seriously.</p>
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-[#2c2c2c] mb-1">Your data stays yours</h3>
            <p className="text-sm text-[#777]">Enterprise-grade encryption. We don't train on your conversations.</p>
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-[#2c2c2c] mb-1">Actionable insights</h3>
            <p className="text-sm text-[#777]">We find tasks, decisions, and sentiment automatically.</p>
          </div>
        </div>

        {/* How it works - simple steps */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-[#2c2c2c] text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d94a4a]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="font-semibold text-[#2c2c2c] mb-2">Record or paste</h3>
              <p className="text-sm text-[#777]">Upload a recording or paste your transcript</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d94a4a]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="font-semibold text-[#2c2c2c] mb-2">AI works its magic</h3>
              <p className="text-sm text-[#777]">We analyze sentiment, extract decisions, and find action items</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d94a4a]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="font-semibold text-[#2c2c2c] mb-2">Get your summary</h3>
              <p className="text-sm text-[#777]">Shareable report ready in seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e8e0d5] mt-20 py-6 text-center text-xs text-[#999]">
        <div className="max-w-6xl mx-auto px-6">
          <span>© 2025 Meetlytics — built for humans, by humans</span>
        </div>
      </footer>
    </div>
  );
}