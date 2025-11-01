"use client";

import { useState, useEffect } from "react";
import { getOrCreateGuestId } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import OshigamiSelector from "@/components/chat/OshigamiSelector";

interface OshigamiOption {
  id: string;
  name: string;
  personality: string;
  icon: string;
}

const FALLBACK_OSHIGAMI: OshigamiOption[] = [
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
  const [oshigamiList, setOshigamiList] = useState<OshigamiOption[]>(FALLBACK_OSHIGAMI);
  const [isLoadingOshigami, setIsLoadingOshigami] = useState<boolean>(true);

  useEffect(() => {
    const initializeGuest = async () => {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    };
    initializeGuest();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("omamori_selected_oshigami");
    if (stored) {
      setSelectedOshigami(stored);
    }
  }, []);

  useEffect(() => {
    const selectInitialOshigami = (list: OshigamiOption[]) => {
      setSelectedOshigami((current) => {
        const stored =
          typeof window !== "undefined"
            ? localStorage.getItem("omamori_selected_oshigami")
            : null;

        const preferred = current || stored;
        if (preferred && list.some((item) => item.id === preferred)) {
          return preferred;
        }

        if (preferred && typeof window !== "undefined") {
          localStorage.removeItem("omamori_selected_oshigami");
        }

        return null;
      });
    };

    const fetchOshigami = async () => {
      try {
        setIsLoadingOshigami(true);
        const { data, error } = await supabase
          .from("oshigami")
          .select("id, name, personality_prompt")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("推し神データ取得エラー:", error);
          setOshigamiList(FALLBACK_OSHIGAMI);
          selectInitialOshigami(FALLBACK_OSHIGAMI);
          return;
        }

        if (!data || data.length === 0) {
          setOshigamiList(FALLBACK_OSHIGAMI);
          selectInitialOshigami(FALLBACK_OSHIGAMI);
          return;
        }

        const fallbackIcons = FALLBACK_OSHIGAMI.map((item) => item.icon);
        const mapped = data.map((item, index) => {
          return {
            id: item.id,
            name: item.name,
            personality: item.personality_prompt || "",
            icon: fallbackIcons[index % fallbackIcons.length],
          };
        });

        setOshigamiList(mapped);
        selectInitialOshigami(mapped);
      } catch (err) {
        console.error("推し神データ取得中に予期せぬエラー:", err);
        setOshigamiList(FALLBACK_OSHIGAMI);
        selectInitialOshigami(FALLBACK_OSHIGAMI);
      } finally {
        setIsLoadingOshigami(false);
      }
    };

    fetchOshigami();
  }, []);

  const handleSelectOshigami = (oshigamiId: string) => {
    setSelectedOshigami(oshigamiId);
    if (typeof window !== "undefined") {
      localStorage.setItem("omamori_selected_oshigami", oshigamiId);
    }
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
        {isLoadingOshigami ? (
          <p className="text-gray-600 mb-8">推し神を読み込み中です...</p>
        ) : !selectedOshigami ? (
          <>
            <h1 className="text-3xl font-bold mb-2">💬 推し神AIチャット</h1>
            <p className="text-gray-600 mb-8">
              あなたの推し神を選んで、対話を始めよう。毎日のおつとめの中で、心を豊かに。
            </p>
            <OshigamiSelector
              oshigami={oshigamiList}
              onSelect={handleSelectOshigami}
            />
          </>
        ) : (
          <ChatWindow
            guestId={guestId}
            oshigami={
              oshigamiList.find((o) => o.id === selectedOshigami) ||
              oshigamiList[0]
            }
            onChangeOshigami={() => {
              setSelectedOshigami(null);
              if (typeof window !== "undefined") {
                localStorage.removeItem("omamori_selected_oshigami");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
