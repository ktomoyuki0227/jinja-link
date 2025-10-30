"use client";

import { useState, useEffect } from "react";
import { getOrCreateGuestId } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import OshigamiSelector from "@/components/chat/OshigamiSelector";

const MOCK_OSHIGAMI = [
  {
    id: "1",
    name: "努力の神",
    personality: "励ましの言葉で応援する。常にポジティブ。",
    icon: "💪",
  },
  {
    id: "2",
    name: "癒しの神",
    personality: "優しく寄り添い、心を落ち着かせる。",
    icon: "🌸",
  },
  {
    id: "3",
    name: "学問の神",
    personality: "知識を広げることを勧める。知的好奇心を刺激する。",
    icon: "📚",
  },
  {
    id: "4",
    name: "恋愛の神",
    personality: "ロマンティックで前向き。幸せを応援する。",
    icon: "💕",
  },
];

export default function ChatPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [selectedOshigami, setSelectedOshigami] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateGuestId();
    setGuestId(id);
    // 前回選択した推し神を取得
    const storedOshigami = localStorage.getItem("omamori_selected_oshigami");
    if (storedOshigami) {
      setSelectedOshigami(storedOshigami);
    }
  }, []);

  const handleSelectOshigami = (oshigamiId: string) => {
    setSelectedOshigami(oshigamiId);
    localStorage.setItem("omamori_selected_oshigami", oshigamiId);
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
        {!selectedOshigami ? (
          <>
            <h1 className="text-3xl font-bold mb-2">💬 推し神AIチャット</h1>
            <p className="text-gray-600 mb-8">
              あなたの推し神を選んで、対話を始めよう。毎日のおつとめの中で、心を豊かに。
            </p>
            <OshigamiSelector
              oshigami={MOCK_OSHIGAMI}
              onSelect={handleSelectOshigami}
            />
          </>
        ) : (
          <ChatWindow
            guestId={guestId}
            oshigami={
              MOCK_OSHIGAMI.find((o) => o.id === selectedOshigami) ||
              MOCK_OSHIGAMI[0]
            }
            onChangeOshigami={() => setSelectedOshigami(null)}
          />
        )}
      </div>
    </div>
  );
}
