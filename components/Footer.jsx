import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e0d5] py-8 text-center text-xs text-[#999] mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© {new Date().getFullYear()} Meetlytics — built for humans, by humans</span>
        <div className="flex gap-6 justify-center">
          <Link href="/twitter" className="hover:text-[#d94a4a] transition-colors">Twitter</Link>
          <Link href="/linkedin" className="hover:text-[#d94a4a] transition-colors">LinkedIn</Link>
          <Link href="/contact" className="hover:text-[#d94a4a] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
