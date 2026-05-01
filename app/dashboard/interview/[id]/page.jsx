import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import Link from "next/link";
import { notFound } from "next/navigation";

// Custom Components
const BackButton = () => (
  <Link 
    href="/dashboard" 
    className="inline-flex items-center gap-2 text-sm text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] transition-all duration-200 group"
  >
    <svg 
      className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to Dashboard
  </Link>
);

const StatusBadge = ({ type }) => {
  const badges = {
    interview: { label: "AI Interview Analysis", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    meeting: { label: "AI Meeting Analysis", color: "bg-[#d94a4a]/10 text-[#d94a4a]" },
    default: { label: "AI Analysis", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" }
  };
  
  const badge = badges[type] || badges.default;
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${badge.color}`}>
      {badge.label}
    </span>
  );
};

const StrengthCard = ({ strengths }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800 h-full transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-5 md:mb-6">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 flex items-center justify-center text-xl">
        💪
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">Strengths</h2>
        <p className="text-xs text-[#999] dark:text-neutral-500">Key positive attributes identified</p>
      </div>
    </div>
    {strengths?.length > 0 ? (
      <ul className="space-y-3 sm:space-y-4">
        {strengths.map((strength, i) => (
          <li key={i} className="flex gap-3 text-sm sm:text-base text-[#555] dark:text-neutral-300">
            <span className="text-[#5a9e4e] mt-0.5 flex-shrink-0">✓</span>
            <span className="leading-relaxed">{strength}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-[#999] dark:text-neutral-500 italic">No specific strengths identified in this interview.</p>
    )}
  </div>
);

const WeaknessCard = ({ weaknesses }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800 h-full transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-5 md:mb-6">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20 flex items-center justify-center text-xl">
        📉
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">Areas for Improvement</h2>
        <p className="text-xs text-[#999] dark:text-neutral-500">Opportunities for growth</p>
      </div>
    </div>
    {weaknesses?.length > 0 ? (
      <ul className="space-y-3 sm:space-y-4">
        {weaknesses.map((weakness, i) => (
          <li key={i} className="flex gap-3 text-sm sm:text-base text-[#555] dark:text-neutral-300">
            <span className="text-[#d94a4a] mt-0.5 flex-shrink-0">✗</span>
            <span className="leading-relaxed">{weakness}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-[#999] dark:text-neutral-500 italic">No significant areas for improvement identified.</p>
    )}
  </div>
);

const SentimentCard = ({ sentiment }) => {
  const getSentimentDisplay = (score) => {
    if (!score) return { emoji: "🤔", label: "Unknown", color: "bg-gray-100 text-gray-700" };
    if (score >= 75) return { emoji: "😎", label: "Very Positive", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (score >= 60) return { emoji: "😊", label: "Positive", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (score >= 40) return { emoji: "🤔", label: "Neutral", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    if (score >= 20) return { emoji: "😕", label: "Slightly Negative", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
    return { emoji: "😰", label: "Negative", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  };

  const display = getSentimentDisplay(sentiment?.score);

  return (
    <div className="bg-gradient-to-br from-[#faf6f0] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800 text-center flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d94a4a]/10 to-[#b83a3a]/5 flex items-center justify-center mb-4">
        <span className="text-5xl">{display.emoji}</span>
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-[#666] dark:text-neutral-400 uppercase tracking-wide mb-2">
        Overall Sentiment
      </h3>
      <div className="text-3xl sm:text-4xl font-bold text-[#2c2c2c] dark:text-white mb-2">
        {sentiment?.score || 0}
        <span className="text-base font-normal text-[#666] dark:text-neutral-400">/100</span>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-2 ${display.color}`}>
        {display.label}
      </div>
      
      {/* Sentiment meter */}
      <div className="w-full mt-6">
        <div className="h-2 bg-[#e8e0d5] dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#d94a4a] via-[#e6a017] to-[#5a9e4e] rounded-full transition-all duration-500"
            style={{ width: `${sentiment?.score || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#999] dark:text-neutral-500 mt-1">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>
    </div>
  );
};

const KeywordsCard = ({ keywords, highlights }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800 h-full">
    <div className="flex items-center gap-3 mb-5 md:mb-6">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/20 flex items-center justify-center text-xl">
        🔑
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">Key Topics & Keywords</h2>
        <p className="text-xs text-[#999] dark:text-neutral-500">Main themes discussed</p>
      </div>
    </div>
    
    {keywords?.length > 0 ? (
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {keywords.map((keyword, i) => (
          <span 
            key={i} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#f7f3ef] dark:bg-neutral-800 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-xs sm:text-sm font-medium text-[#555] dark:text-neutral-300 transition-all hover:bg-[#d94a4a]/5 hover:border-[#d94a4a]/30 cursor-default"
          >
            {keyword}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-[#999] dark:text-neutral-500 italic">No specific keywords identified.</p>
    )}
    
    {highlights?.length > 0 && (
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#efe5db] dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold text-[#2c2c2c] dark:text-white">Emotional Highlights</h3>
        </div>
        <ul className="space-y-2 sm:space-y-3">
          {highlights.slice(0, 4).map((highlight, i) => (
            <li key={i} className="text-xs sm:text-sm text-[#666] dark:text-neutral-400 italic leading-relaxed pl-3 border-l-2 border-[#d94a4a]/30">
              "{highlight}"
            </li>
          ))}
        </ul>
        {highlights.length > 4 && (
          <button className="text-xs text-[#d94a4a] hover:underline mt-2">
            View all highlights →
          </button>
        )}
      </div>
    )}
  </div>
);

const HeaderSection = ({ title, overview, type, date }) => (
  <div className="relative bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
    <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-[#d94a4a]/5 to-[#b83a3a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-[#5a9e4e]/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
    
    <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6">
        <StatusBadge type={type} />
        {date && (
          <div className="flex items-center gap-2 text-xs text-[#999] dark:text-neutral-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        )}
      </div>
      
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c2c2c] dark:text-white leading-tight mb-4">
        {title || "Interview Results"}
      </h1>
      
      <p className="text-sm sm:text-base md:text-lg text-[#666] dark:text-neutral-400 leading-relaxed max-w-3xl">
        {overview || "No overview available for this interview."}
      </p>
      
      {/* Quick stats */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 pt-4 border-t border-[#efe5db] dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5a9e4e]"></div>
          <span className="text-xs text-[#666] dark:text-neutral-400">AI Generated Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#d94a4a]"></div>
          <span className="text-xs text-[#666] dark:text-neutral-400">Real-time Processing</span>
        </div>
      </div>
    </div>
  </div>
);

const ActionButtons = ({ meetingId, onExport }) => (
  <div className="flex flex-wrap gap-3">
    <button
      onClick={onExport}
      className="px-4 py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export PDF
    </button>
    <button
      onClick={() => navigator.clipboard.writeText(window.location.href)}
      className="px-4 py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
      Share Link
    </button>
  </div>
);

const LoadingSkeleton = () => (
  <main className="flex-1 bg-[#f7f3ef] dark:bg-neutral-950 p-4 sm:p-6 md:p-12">
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-32"></div>
        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-24"></div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8">
        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6 mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-3xl"></div>
        <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-3xl"></div>
      </div>
    </div>
  </main>
);

export default async function InterviewResultPage({ params }) {
  const { id } = await params;
  
  try {
    await connectToDatabase();
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      notFound();
    }

    const data = meeting.toObject();

    const handleExport = () => {
      // This would be a client-side function, but since this is a server component,
      // you'd need to implement this with client-side JS or use a button component
      console.log("Export functionality would go here");
    };

    return (
      <main className="flex-1 min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 space-y-5 sm:space-y-6 md:space-y-8">
          
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <BackButton />
            <ActionButtons meetingId={id} onExport={handleExport} />
          </div>

          {/* Main Header Section */}
          <HeaderSection 
            title={data.title}
            overview={data.overview}
            type={data.type || "interview"}
            date={data.createdAt}
          />

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <StrengthCard strengths={data.strengths} />
            <WeaknessCard weaknesses={data.weaknesses} />
          </div>

          {/* Sentiment & Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-1">
              <SentimentCard sentiment={data.sentiment} />
            </div>
            <div className="md:col-span-2">
              <KeywordsCard 
                keywords={data.keyDecisions || data.keywords || []}
                highlights={data.sentiment?.highlights || []}
              />
            </div>
          </div>

          {/* Additional Recommendations Section */}
          {data.recommendations?.length > 0 && (
            <div className="bg-gradient-to-r from-[#fef8f0] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-[#f0e4d0] dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#fff4e5] dark:bg-orange-900/30 flex items-center justify-center text-xl">
                  💡
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">Recommendations</h2>
                  <p className="text-xs text-[#999] dark:text-neutral-500">Actionable insights for improvement</p>
                </div>
              </div>
              <ul className="space-y-3">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm sm:text-base text-[#555] dark:text-neutral-300">
                    <span className="text-[#e6a017] mt-0.5">→</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-[#efe5db] dark:border-neutral-800 text-center">
            <p className="text-xs text-[#999] dark:text-neutral-500">
              🤖 AI-generated interview analysis • Last updated {new Date(data.updatedAt || data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading interview:", error);
    notFound();
  }
}

// Optional: Add metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    await connectToDatabase();
    const meeting = await Meeting.findById(id);
    
    if (!meeting) {
      return {
        title: "Interview Not Found",
        description: "The requested interview analysis could not be found."
      };
    }
    
    return {
      title: `${meeting.title || "Interview Results"} | Meetlytics`,
      description: meeting.overview?.substring(0, 160) || "AI-powered interview analysis and insights",
    };
  } catch {
    return {
      title: "Interview Results | Meetlytics",
      description: "AI-powered interview analysis and insights"
    };
  }
}