import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import MeetingView from "@/components/MeetingView";
import Link from "next/link";

const ErrorState = ({ message, linkText, linkHref }) => (
  <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-[#d94a4a]/10 to-[#b83a3a]/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">📄</span>
      </div>
      <h2 className="text-2xl font-bold text-[#2c2c2c] dark:text-white mb-2">
        {message || "Meeting Not Found"}
      </h2>
      <p className="text-[#666] dark:text-neutral-400 mb-6">
        The meeting you're looking for doesn't exist or has been deleted.
      </p>
      <Link 
        href={linkHref || "/dashboard/history"} 
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {linkText || "Go back to History"}
      </Link>
    </div>
  </div>
);

export default async function StandardMeetingPage({ params }) {
  const { id } = await params;
  
  try {
    await connectToDatabase();
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return <ErrorState />;
    }

    // Convert to plain object for passing to Client Component
    const data = JSON.parse(JSON.stringify(meeting));
    
    // Prepare data for ResultsDashboard
    const dashboardData = {
      title: data.title || "Untitled Meeting",
      overview: data.overview || "No overview available for this meeting.",
      takeaways: data.takeaways || [],
      actionItems: data.actionItems || [],
      sentiment: data.sentiment || { score: 50, overall: "neutral", highlights: [] },
      keyDecisions: data.keyDecisions || [],
      meetingDate: data.createdAt,
      duration: data.duration,
      type: data.type || "meeting"
    };

    return <MeetingView meeting={data} dashboardData={dashboardData} />;
  } catch (error) {
    console.error("Error loading meeting:", error);
    return <ErrorState message="Error Loading Meeting" />;
  }
}

// Add metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    await connectToDatabase();
    const meeting = await Meeting.findById(id);
    
    if (!meeting) {
      return {
        title: "Meeting Not Found | Meetlytics",
        description: "The requested meeting analysis could not be found."
      };
    }
    
    const actionItemCount = meeting.actionItems?.length || 0;
    const decisionCount = meeting.keyDecisions?.length || 0;
    
    return {
      title: `${meeting.title || "Meeting Analysis"} | Meetlytics`,
      description: meeting.overview?.substring(0, 160) || `Meeting analysis with ${actionItemCount} action items and ${decisionCount} key decisions.`,
      openGraph: {
        title: meeting.title || "Meeting Analysis",
        description: meeting.overview?.substring(0, 160),
        type: 'article',
        publishedTime: meeting.createdAt,
      },
    };
  } catch {
    return {
      title: "Meeting Analysis | Meetlytics",
      description: "AI-powered meeting analysis and insights"
    };
  }
}