"use client";

import Link from "next/link";

interface HomeCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export default function HomeCard({
  title,
  description,
  icon,
  href,
  color,
}: HomeCardProps) {
  return (
    <Link href={href}>
      <div className={`bg-gradient-to-br ${color} rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-shadow`}>
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-white/90">{description}</p>
        <div className="mt-4 text-sm text-white/80">詳しく →</div>
      </div>
    </Link>
  );
}
