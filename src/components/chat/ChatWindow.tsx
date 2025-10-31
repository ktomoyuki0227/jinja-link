"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { envConfig } from "@/lib/env";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatMessage {
  id: string;
  guest_id: string;
  oshigami_id: string;
  user_message: string;
  ai_reply: string;
  emotion?: string;
  created_at: string;
}

interface Oshigami {
  id: string;
  name: string;
  personality: string;
  icon: string;
}

interface Props {
  guestId: string;
  oshigami: Oshigami;
  onChangeOshigami: () => void;
}

export default function ChatWindow({
  guestId,
  oshigami,
  onChangeOshigami,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // チャット履歴を Supabase から取得
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("chat_logs")
          .select("*")
          .eq("guest_id", guestId)
          .eq("oshigami_id", oshigami.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("チャット履歴取得エラー:", error);
          return;
        }

        setMessages(data || []);
      } catch (err) {
        console.error("チャット履歴取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [guestId, oshigami.id]);

  // メッセージ送信時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信処理
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    try {
      setIsSending(true);

      // AI応答を生成（IO.Intelligence API を使用）
      const aiReply = await generateAIResponse(userMessage);

      // Supabase に保存
      const { error } = await supabase.from("chat_logs").insert({
        guest_id: guestId,
        oshigami_id: oshigami.id,
        user_message: userMessage,
        ai_reply: aiReply,
        emotion: "neutral",
      });

      if (error) {
        console.error("メッセージ保存エラー:", error);
        return;
      }

      // 画面に反映 - 保存後、チャット履歴を再取得
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          guest_id: guestId,
          oshigami_id: oshigami.id,
          user_message: userMessage,
          ai_reply: aiReply,
          emotion: "neutral",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("メッセージ送信エラー:", err);
    } finally {
      setIsSending(false);
    }
  };

  // AI応答生成関数
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // IO.Intelligence API を呼び出し
      const response = await fetch(
        `${envConfig.ioIntelligenceApiUrl}/chat`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${envConfig.ioIntelligenceApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guest_id: guestId,
            prompt: userMessage,
            oshigami_id: oshigami.id,
            personality: oshigami.personality,
          }),
        }
      );

      if (!response.ok) {
        console.error("API Error:", response.statusText);
        // フォールバック: モック応答
        return getMockResponse(oshigami.personality);
      }

      const result = await response.json();
      return result.reply || getMockResponse(oshigami.personality);
    } catch (err) {
      console.error("AI応答生成エラー:", err);
      // フォールバック: モック応答
      return getMockResponse(oshigami.personality);
    }
  };

  // モック応答（API エラー時のフォールバック）
  const getMockResponse = (personality: string): string => {
    const responses: { [key: string]: string[] } = {
      "励ましの言葉で応援する。常にポジティブ。": [
        "頑張ってください！あなたなら必ずできます！",
        "応援しています。一歩一歩進めば大丈夫。",
        "失敗は成功の母。前に進んでいきましょう！",
      ],
      "優しく寄り添い、心を落ち着かせる。": [
        "そうなんですね。それは大変でしたね。",
        "あなたの気持ちをお聞かせください。",
        "ゆっくりでいいんですよ。焦らなくて大丈夫です。",
      ],
      "知識を広げることを勧める。知的好奇心を刺激する。": [
        "それは興味深いですね。もっと詳しく知ってみませんか？",
        "こういう視点もありますよ。",
        "勉強は素晴らしいことです。知識は財産ですから。",
      ],
      "ロマンティックで前向き。幸せを応援する。": [
        "素敵ですね！幸せになってください！",
        "そういう時間って大切ですよね。",
        "あなたの幸せを心から応援しています。",
      ],
    };

    const categoryResponses =
      responses[personality] || responses["励ましの言葉で応援する。常にポジティブ。"];
    return categoryResponses[
      Math.floor(Math.random() * categoryResponses.length)
    ];
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-red-50 to-pink-50">
      {/* ヘッダー */}
      <div className="sticky top-16 bg-white border-b border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{oshigami.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {oshigami.name}
              </h2>
              <p className="text-sm text-gray-500">{oshigami.personality}</p>
            </div>
          </div>
          <button
            onClick={onChangeOshigami}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            変更
          </button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">{oshigami.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {oshigami.name}へようこそ
            </h3>
            <p className="text-gray-600">
              最初のメッセージを送ってみましょう。
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage
                  role="user"
                  content={message.user_message}
                  timestamp={message.created_at}
                />
                <ChatMessage
                  role="assistant"
                  content={message.ai_reply}
                  timestamp={message.created_at}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 入力エリア */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <ChatInput onSend={handleSendMessage} isLoading={isSending} />
      </div>
    </div>
  );
}
