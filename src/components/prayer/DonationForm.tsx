"use client";

import { useState } from "react";

interface DonationFormProps {
  shrineId: string;
  guestId: string;
  onSuccess: (points: number) => void;
}

export default function DonationForm({
  shrineId,
  guestId,
  onSuccess,
}: DonationFormProps) {
  const [selectedPoints, setSelectedPoints] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDonate = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // API呼び出し（現在はモック）
      // 実装予定: /api/donation エンドポイント

      // シミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ローカルストレージに保存
      const donations = JSON.parse(
        localStorage.getItem("omamori_donations") || "[]"
      );
      donations.push({
        id: Math.random().toString(),
        guest_id: guestId,
        shrine_id: shrineId,
        point: selectedPoints,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("omamori_donations", JSON.stringify(donations));

      setMessage(
        `✨ ${selectedPoints}ポイントを寄付しました！ご支援ありがとうございます！`
      );
      onSuccess(selectedPoints);
      setSelectedPoints(1);

      // 2秒後にメッセージをクリア
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("寄付に失敗しました。もう一度お試しください。");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-lg font-bold mb-4">寄付するポイント</label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 5, 10, 50].map((point) => (
            <button
              key={point}
              onClick={() => setSelectedPoints(point)}
              className={`py-2 px-4 rounded-lg font-bold transition-all ${
                selectedPoints === point
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {point}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-bold mb-2">カスタムポイント</label>
        <input
          type="number"
          value={selectedPoints}
          onChange={(e) => setSelectedPoints(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          max="1000"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
        />
      </div>

      <button
        onClick={handleDonate}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isLoading ? "寄付中..." : `🎁 ${selectedPoints}ポイント寄付`}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg text-center font-bold ${
            message.includes("失敗")
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
