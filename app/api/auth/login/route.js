import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      // Mock Login fallback
      if (email === "test@example.com" && password === "password") {
        const token = jwt.sign({ id: "mock-id", email }, JWT_SECRET, { expiresIn: "1d" });
        const res = NextResponse.json({ message: "Mock login successful" });
        res.cookies.set("token", token, { httpOnly: true, path: "/" });
        return res;
      }
      return NextResponse.json({ message: "Invalid credentials (mock)" }, { status: 401 });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, company: user.company }, JWT_SECRET, { expiresIn: "7d" });

    const res = NextResponse.json({ message: "Login successful", user: { id: user._id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, company: user.company } });
    
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
