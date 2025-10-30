"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrCreateGuestId } from "@/lib/utils";
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

  useEffect(() => {
    const id = getOrCreateGuestId();
    setGuestId(id);

    // localStorageからデータを取得
    const totalPoints = localStorage.getItem("omamori_total_points");
    const donations = JSON.parse(
      localStorage.getItem("omamori_donations") || "[]"
    );
    const messages = JSON.parse(
      localStorage.getItem("omamori_chat_messages") || "[]"
    );

    // 寄付が最も多い神社を計算
    interface DonationCount {
      [key: string]: number;
    }
    const shrineCounts: DonationCount = {};
    donations.forEach(
      (donation: { shrine_id: string }) => {
        shrineCounts[donation.shrine_id] =
          (shrineCounts[donation.shrine_id] || 0) + 1;
      }
    );
    const preferredShrine =
      Object.keys(shrineCounts).length > 0
        ? Object.keys(shrineCounts).reduce((a, b) =>
            shrineCounts[a] > shrineCounts[b] ? a : b
          )
        : "未設定";

    setStats({
      totalPoints: parseInt(totalPoints || "0", 10),
      donationCount: donations.length,
      messageCount: messages.length,
      preferredShrine: preferredShrine === "未設定" ? "未設定" : `神社ID: ${preferredShrine}`,
    });
  }, []);

  if (!guestId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
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
            value={localStorage.getItem("omamori_selected_oshigami") ? "設定済み" : "未設定"}
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
