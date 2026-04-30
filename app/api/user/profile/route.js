import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function PUT(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { fullName, email, avatarUrl, company } = await request.json();

    const db = await connectToDatabase();
    if (!db) {
      // Mock update fallback
      return NextResponse.json({ message: "Profile updated successfully (Mock)", user: { fullName, email, avatarUrl, company } });
    }

    const user = await User.findByIdAndUpdate(decoded.id, { fullName, email, avatarUrl, company }, { new: true });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Refresh token with new data
    const newToken = jwt.sign({ id: user._id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, company: user.company }, JWT_SECRET, { expiresIn: "7d" });

    const res = NextResponse.json({ message: "Profile updated successfully", user: { id: user._id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, company: user.company } });
    
    res.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
