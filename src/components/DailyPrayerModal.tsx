"use client";

import { useState } from "react";
import { completeDailyPrayer, DAILY_PRAYER_BONUS } from "@/lib/dailyPrayer";

interface DailyPrayerModalProps {
  guestId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function DailyPrayerModal({
  guestId,
  onComplete,
  onClose,
}: DailyPrayerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShrineId, setSelectedShrineId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // ダミー神社（実装版ではダッシュボードから動的に取得可能）
  const SHRINES = [
    { id: "1", name: "八坂神社", icon: "⛩️" },
    { id: "2", name: "伏見稲荷大社", icon: "🌾" },
    { id: "3", name: "厳島神社", icon: "🌊" },
    { id: "4", name: "明治神宮", icon: "🍃" },
  ];

  const handlePray = async () => {
    if (!selectedShrineId) {
      setMessage("神社を選んでください");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await completeDailyPrayer(guestId, selectedShrineId);

      if (result.success) {
        setMessage(
          `✨ 本日のおつとめ完了！ ${DAILY_PRAYER_BONUS}ポイントゲット！`
        );
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      } else {
        setMessage("おつとめ記録に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      console.error("おつとめエラー:", err);
      setMessage("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            本日のおつとめ
          </h2>
          <p className="text-gray-600">
            神社を選んでお祈りすると、<br />
            <span className="font-bold text-red-500">
              {DAILY_PRAYER_BONUS}ポイント
            </span>
            ゲット！
          </p>
        </div>

        {/* 神社選択 */}
        <div className="mb-6">
          <label className="block text-lg font-bold mb-4">
            お祈りする神社を選んでください
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SHRINES.map((shrine) => (
              <button
                key={shrine.id}
                onClick={() => setSelectedShrineId(shrine.id)}
                disabled={isLoading}
                className={`p-4 rounded-lg font-semibold transition-all ${
                  selectedShrineId === shrine.id
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                <div className="text-2xl mb-1">{shrine.icon}</div>
                <div className="text-sm">{shrine.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`p-4 rounded-lg text-center font-bold mb-6 ${
              message.includes("✨")
                ? "bg-green-100 text-green-800"
                : message.includes("失敗")
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
          >
            スキップ
          </button>
          <button
            onClick={handlePray}
            disabled={isLoading || !selectedShrineId}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {isLoading ? "祈っています..." : "🙏 お祈りする"}
          </button>
        </div>

        {/* ボーナス説明 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700">
            <span className="font-bold">💡 ポイント獲得のコツ：</span>
            <br />
            毎日のおつとめを欠かさず、ポイントを集めよう！
          </p>
        </div>
      </div>
    </div>
  );
}
