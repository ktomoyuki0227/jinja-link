"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrCreateGuestId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import DonationChart from "@/components/dashboard/DonationChart";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";

export default function DashboardPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    donationCount: 0,
    messageCount: 0,
    preferredShrine: "未設定",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const id = getOrCreateGuestId();
        setGuestId(id);

        // 寄付ログからデータを取得
        const { data: donations, error: donationError } = await supabase
          .from("donation_logs")
          .select("point, shrine_id")
          .eq("guest_id", id);

        if (donationError) {
          console.error("寄付ログ取得エラー:", donationError);
          return;
        }

        // チャットログからメッセージ数を取得
        const { data: chats, error: chatError } = await supabase
          .from("chat_logs")
          .select("id")
          .eq("guest_id", id);

        if (chatError) {
          console.error("チャットログ取得エラー:", chatError);
          return;
        }

        // 総ポイント計算
        const totalPoints = (donations || []).reduce(
          (sum, log) => sum + (log.point || 0),
          0
        );

        // 最も寄付している神社を計算
        interface ShrineCount {
          [key: string]: number;
        }
        const shrineCounts: ShrineCount = {};
        (donations || []).forEach((donation) => {
          if (donation.shrine_id) {
            shrineCounts[donation.shrine_id] =
              (shrineCounts[donation.shrine_id] || 0) + 1;
          }
        });

        let preferredShrine = "未設定";
        if (Object.keys(shrineCounts).length > 0) {
          const topShrine = Object.keys(shrineCounts).reduce((a, b) =>
            shrineCounts[a] > shrineCounts[b] ? a : b
          );
          // 神社IDから名前を取得（Supabaseから）
          const { data: shrineData } = await supabase
            .from("shrines")
            .select("name")
            .eq("id", topShrine)
            .single();

          preferredShrine = shrineData?.name || `神社ID: ${topShrine}`;
        }

        setStats({
          totalPoints,
          donationCount: donations?.length || 0,
          messageCount: chats?.length || 0,
          preferredShrine,
        });
      } catch (err) {
        console.error("統計データ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (!guestId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>統計データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation guestId={guestId} />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">📊 ダッシュボード</h1>
        <p className="text-gray-600 mb-8">
          あなたの行動データと寄付の履歴を可視化します。
        </p>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <StatsCard
            title="累計ポイント"
            value={stats.totalPoints}
            icon="✨"
            color="from-yellow-400 to-yellow-600"
          />
          <StatsCard
            title="寄付回数"
            value={stats.donationCount}
            icon="🎁"
            color="from-red-400 to-red-600"
          />
          <StatsCard
            title="チャット回数"
            value={stats.messageCount}
            icon="💬"
            color="from-pink-400 to-pink-600"
          />
          <StatsCard
            title="推し神"
            value={stats.preferredShrine}
            icon="⛩️"
            color="from-purple-400 to-purple-600"
          />
        </div>

        {/* グラフセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">寄付傾向</h2>
            <DonationChart />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">活動タイムライン</h2>
            <ActivityTimeline guestId={guestId} />
          </div>
        </div>

        {/* リンク */}
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/prayer"
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
          >
            🙏 おつとめ
          </Link>
          <Link
            href="/chat"
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold"
          >
            💬 チャット
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            ← ホーム
          </Link>
        </div>
      </div>
    </div>
  );
}
