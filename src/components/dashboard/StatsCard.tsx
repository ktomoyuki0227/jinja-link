"use client";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
}: StatsCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${color} text-white rounded-lg shadow-lg p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}
