"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ActivityLog {
  id: string;
  type: "donation" | "chat" | "prayer";
  description: string;
  timestamp: string;
  icon: string;
}

interface ActivityTimelineProps {
  guestId: string;
}

export default function ActivityTimeline({ guestId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        // 寄付ログを取得
        const { data: donations } = await supabase
          .from("donation_logs")
          .select("id, point, event_type, created_at")
          .eq("guest_id", guestId)
          .order("created_at", { ascending: false })
          .limit(10);

        // チャットログを取得
        const { data: chats } = await supabase
          .from("chat_logs")
          .select("id, user_message, created_at")
          .eq("guest_id", guestId)
          .order("created_at", { ascending: false })
          .limit(10);

        // アクティビティを統合
        const logs: ActivityLog[] = [];

        // 寄付ログをマッピング
        (donations || []).forEach((donation) => {
          const isDailyBonus = donation.event_type === "daily_prayer_bonus";
          logs.push({
            id: donation.id,
            type: "donation",
            description: isDailyBonus
              ? `毎日のおつとめボーナス: +${donation.point}pt`
              : `寄付: +${donation.point}pt`,
            timestamp: donation.created_at,
            icon: isDailyBonus ? "✨" : "🎁",
          });
        });

        // チャットログをマッピング
        (chats || []).forEach((chat) => {
          logs.push({
            id: chat.id,
            type: "chat",
            description: `メッセージ: "${chat.user_message.substring(0, 30)}..."`,
            timestamp: chat.created_at,
            icon: "💬",
          });
        });

        // タイムスタンプでソート
        logs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(logs.slice(0, 10)); // 最新10件
      } catch (err) {
        console.error("アクティビティ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [guestId]);

  if (isLoading) {
    return <div className="text-gray-500 text-center py-4">読み込み中...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        まだアクティビティはありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-pink-500"
        >
          <div className="text-2xl">{activity.icon}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{activity.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(activity.timestamp).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
