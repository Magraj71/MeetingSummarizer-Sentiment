import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ meetings: [] });
    }

    const meetings = await Meeting.find({ userId: decoded.id }).sort({ createdAt: -1 });
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ message: "Failed to fetch meetings" }, { status: 500 });
  }
}
