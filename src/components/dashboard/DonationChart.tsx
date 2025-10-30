"use client";

import { useEffect, useState } from "react";

interface DonationData {
  [key: string]: number;
}

export default function DonationChart() {
  const [donationData, setDonationData] = useState<DonationData>({});

  useEffect(() => {
    const donations = JSON.parse(
      localStorage.getItem("omamori_donations") || "[]"
    );

    // 神社別の寄付ポイント集計
    const shrineData: DonationData = {};
    const shrineNames: { [key: string]: string } = {
      "1": "八坂神社",
      "2": "伏見稲荷大社",
      "3": "厳島神社",
      "4": "明治神宮",
    };

    donations.forEach(
      (donation: { shrine_id: string; point: number }) => {
        const shrineName =
          shrineNames[donation.shrine_id] || `神社 ${donation.shrine_id}`;
        shrineData[shrineName] = (shrineData[shrineName] || 0) + donation.point;
      }
    );

    setDonationData(shrineData);
  }, []);

  const maxValue = Math.max(...Object.values(donationData), 1);

  return (
    <div className="space-y-4">
      {Object.entries(donationData).length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          まだ寄付がありません。おつとめを始めましょう！
        </p>
      ) : (
        Object.entries(donationData).map(([shrine, points]) => (
          <div key={shrine}>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{shrine}</span>
              <span className="text-red-600 font-bold">{points}pt</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${(points / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
