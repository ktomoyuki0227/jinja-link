"use client";

import Link from "next/link";

interface NavigationProps {
  guestId: string;
}

export default function Navigation({ guestId }: NavigationProps) {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⛩️</span>
          <h1 className="text-xl font-bold text-red-600">おまモリ。</h1>
        </Link>
        <div className="text-xs text-gray-500 hidden sm:block">
          Guest ID: {guestId.slice(0, 8)}...
        </div>
      </div>
    </nav>
  );
}
