"use client";

import { useEffect, useState } from "react";
import { getOrCreateGuestId } from "@/lib/utils";
import {
  checkDailyPrayerStatus,
  shouldShowDailyPrayerModal,
  markDailyPrayerModalShown,
} from "@/lib/dailyPrayer";
import Navigation from "@/components/Navigation";
import HomeHero from "@/components/home/HomeHero";
import HomeCard from "@/components/home/HomeCard";
import DailyPrayerModal from "@/components/DailyPrayerModal";

export default function HomePage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [showDailyPrayerModal, setShowDailyPrayerModal] = useState(false);

  useEffect(() => {
    const initializeGuest = async () => {
      const id = await getOrCreateGuestId();
      setGuestId(id);

      // 毎日のおつとめモーダル表示確認
      if (shouldShowDailyPrayerModal()) {
        const status = await checkDailyPrayerStatus(id);
        if (!status.has_prayed_today) {
          setShowDailyPrayerModal(true);
        }
      }
    };
    initializeGuest();
  }, []);

  const handleDailyPrayerComplete = () => {
    markDailyPrayerModalShown();
  };

  if (!guestId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation guestId={guestId} />

      {/* 毎日のおつとめモーダル */}
      {showDailyPrayerModal && (
        <DailyPrayerModal
          guestId={guestId}
          onComplete={handleDailyPrayerComplete}
          onClose={() => {
            setShowDailyPrayerModal(false);
            markDailyPrayerModalShown();
          }}
        />
      )}

      <HomeHero />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HomeCard
            title="おつとめ"
            description="毎日のおつとめで、神社を支援しよう"
            icon="🙏"
            href="/prayer"
            color="from-red-400 to-red-600"
          />
          <HomeCard
            title="推し神AIチャット"
            description="あなたの推し神と対話して、心を豊かに"
            icon="💬"
            href="/chat"
            color="from-pink-400 to-pink-600"
          />
          <HomeCard
            title="神社ガイド"
            description="全国の神社を探索する"
            icon="⛩️"
            href="/shrines"
            color="from-orange-400 to-orange-600"
          />
          <HomeCard
            title="ダッシュボード"
            description="あなたの行動と寄付を可視化"
            icon="📊"
            href="/dashboard"
            color="from-yellow-400 to-yellow-600"
          />
        </div>
      </div>
    </div>
  );
}
