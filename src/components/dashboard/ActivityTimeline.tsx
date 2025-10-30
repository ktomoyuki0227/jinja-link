"use client";

interface ActivityTimelineProps {
  guestId: string;
}

export default function ActivityTimeline({
  guestId,
}: ActivityTimelineProps) {
  const activities = [
    {
      icon: "🙏",
      action: "おつとめ",
      description: "神社への祈りと寄付",
      time: "1時間前",
    },
    {
      icon: "💬",
      action: "AIチャット",
      description: "推し神との対話",
      time: "2時間前",
    },
    {
      icon: "✨",
      action: "ポイント加算",
      description: "100ポイント獲得",
      time: "3時間前",
    },
    {
      icon: "⛩️",
      action: "神社訪問",
      description: "八坂神社を支援",
      time: "5時間前",
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4 pb-4 border-b border-gray-200">
          <div className="text-2xl">{activity.icon}</div>
          <div className="flex-1">
            <p className="font-semibold">{activity.action}</p>
            <p className="text-sm text-gray-600">{activity.description}</p>
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
}
