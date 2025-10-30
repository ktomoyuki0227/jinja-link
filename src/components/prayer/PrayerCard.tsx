"use client";

interface PrayerCardProps {
  shrine: {
    id: string;
    name: string;
    location: string;
    icon: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function PrayerCard({
  shrine,
  isSelected,
  onSelect,
}: PrayerCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-red-500 bg-red-50"
          : "border-gray-200 bg-white hover:border-red-300"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{shrine.icon}</div>
        <div className="flex-1">
          <h4 className="text-lg font-bold">{shrine.name}</h4>
          <p className="text-sm text-gray-600">{shrine.location}</p>
          {isSelected && (
            <p className="text-sm text-red-600 font-semibold mt-2">✓ 選択済み</p>
          )}
        </div>
      </div>
    </div>
  );
}
