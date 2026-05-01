"use client";

import React, { useState } from "react";

export const TranscriptAccordion = ({ transcript }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#efe5db] dark:border-neutral-800 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <div className="text-left">
            <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-white">Full Meeting Transcript</h3>
            <p className="text-xs text-[#999] dark:text-neutral-500">Structured conversation log</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2">
          <div className="bg-[#fcfaf7] dark:bg-neutral-950 rounded-xl p-4 max-h-[500px] overflow-y-auto border border-[#f0e4d0] dark:border-neutral-800 space-y-4">
            {transcript ? (
              transcript.split('\n\n').map((block, i) => {
                // Handle "Sender: Text" format
                const separatorIndex = block.indexOf(': ');
                if (separatorIndex === -1) return <div key={i} className="text-sm text-gray-500 italic">{block}</div>;
                
                const sender = block.substring(0, separatorIndex);
                const text = block.substring(separatorIndex + 2);
                const isYou = sender.toLowerCase().includes("you");
                
                return (
                  <div key={i} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sender}</span>
                    </div>
                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                      isYou 
                        ? 'bg-[#d94a4a] text-white rounded-tr-none shadow-sm' 
                        : 'bg-white dark:bg-neutral-800 text-[#555] dark:text-neutral-300 border border-[#efe5db] dark:border-neutral-700 rounded-tl-none shadow-sm'
                    }`}>
                      {text}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8 italic">No transcript data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
