import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      default: "",
    },
    takeaways: [
      {
        type: String,
      },
    ],
    actionItems: [
      {
        task: String,
        assignee: String,
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
      },
    ],
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ["standard", "interview"],
      default: "standard",
    },
    sentiment: {
      overall: String,
      score: Number,
      highlights: [String],
    },
    keyDecisions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model in Next.js development
export default mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
