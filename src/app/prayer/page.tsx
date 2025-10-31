"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrCreateGuestId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import PrayerCard from "@/components/prayer/PrayerCard";
import DonationForm from "@/components/prayer/DonationForm";

// ダミー神社データ
const MOCK_SHRINES = [
  {
    id: "1",
    name: "八坂神社",
    location: "京都府京都市東山区",
    icon: "⛩️",
  },
  {
    id: "2",
    name: "伏見稲荷大社",
    location: "京都府京都市伏見区",
    icon: "🌾",
  },
  {
    id: "3",
    name: "厳島神社",
    location: "広島県廿日市市",
    icon: "🌊",
  },
  {
    id: "4",
    name: "明治神宮",
    location: "東京都渋谷区",
    icon: "🍃",
  },
];

export default function PrayerPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [selectedShrine, setSelectedShrine] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const initializePage = async () => {
      const id = getOrCreateGuestId();
      setGuestId(id);

      // Supabaseから総ポイントを取得
      try {
        const { data, error } = await supabase
          .from("donation_logs")
          .select("point")
          .eq("guest_id", id);

        if (error) {
          console.error("ポイント取得エラー:", error);
          return;
        }

        const total = (data || []).reduce(
          (sum, log) => sum + (log.point || 0),
          0
        );
        setTotalPoints(total);
      } catch (err) {
        console.error("ポイント計算エラー:", err);
      }
    };

    initializePage();
  }, []);

  const handleDonation = async (points: number) => {
    const newTotal = totalPoints + points;
    setTotalPoints(newTotal);
  };

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
        {/* ポイント表示 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-2">あなたのポイント</h2>
          <p className="text-5xl font-bold">{totalPoints}</p>
          <p className="text-sm mt-2">あつめたポイントで、神社を支援しよう</p>
        </div>

        <h1 className="text-3xl font-bold mb-2">🙏 おつとめ</h1>
        <p className="text-gray-600 mb-8">
          毎日のおつとめで、神社に寄付できます。祈りの気持ちと一緒にポイントを送ろう。
        </p>

        {/* 神社選択 */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6">支援したい神社を選ぶ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SHRINES.map((shrine) => (
              <PrayerCard
                key={shrine.id}
                shrine={shrine}
                isSelected={selectedShrine === shrine.id}
                onSelect={() => setSelectedShrine(shrine.id)}
              />
            ))}
          </div>
        </div>

        {/* 寄付フォーム */}
        {selectedShrine && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h3 className="text-xl font-bold mb-6">
              {MOCK_SHRINES.find((s) => s.id === selectedShrine)?.name} へ寄付
            </h3>
            <DonationForm
              shrineId={selectedShrine}
              guestId={guestId}
              onSuccess={handleDonation}
            />
          </div>
        )}

        {/* もどるボタン */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            ← ホームにもどる
          </Link>
        </div>
      </div>
    </div>
  );
}
