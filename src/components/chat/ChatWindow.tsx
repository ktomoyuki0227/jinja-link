"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { formatTime } from "@/lib/utils";

interface Oshigami {
  id: string;
  name: string;
  personality: string;
  icon: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  guestId: string;
  oshigami: Oshigami;
  onChangeOshigami: () => void;
}

export default function ChatWindow({
  guestId,
  oshigami,
  onChangeOshigami,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ページロード時にチャットログを取得
  useEffect(() => {
    const storedMessages = localStorage.getItem(
      `omamori_chat_${guestId}_${oshigami.id}`
    );
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // 初回チャット時のウェルカムメッセージ
      const welcomeMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: `こんにちは！私は${oshigami.name}です。${oshigami.personality}何かお話しましょうか？`,
        timestamp: formatTime(new Date()),
      };
      setMessages([welcomeMessage]);
    }
  }, [guestId, oshigami.id, oshigami.name, oshigami.personality]);

  // メッセージ送信時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    // ユーザーメッセージを追加
    const newUserMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userMessage,
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // AI応答を生成（現在はモック）
      // 実装予定: /api/ai-chat エンドポイント
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // モック応答
      const mockResponses = [
        "そうですね、あなたの頑張りはきっと報われます！",
        "心の声をありがとうございます。一緒に頑張りましょう。",
        "素敵な考え方ですね。その調子で進み続けてください。",
        "私はあなたを応援しています。信じて進みましょう。",
      ];

      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const newAiMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: formatTime(new Date()),
      };

      setMessages((prev) => [...prev, newAiMessage]);

      // localStorageに保存
      const updatedMessages = [...messages, newUserMessage, newAiMessage];
      localStorage.setItem(
        `omamori_chat_${guestId}_${oshigami.id}`,
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{oshigami.icon}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{oshigami.name}</h2>
            <p className="text-pink-100">{oshigami.personality}</p>
          </div>
          <button
            onClick={onChangeOshigami}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 font-semibold"
          >
            変更
          </button>
        </div>
      </div>

      {/* チャットウィンドウ */}
      <div className="bg-white rounded-lg shadow-lg p-6 h-96 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />

      {/* もどるボタン */}
      <div className="flex gap-2 justify-center">
        <Link
          href="/"
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
        >
          ← ホームにもどる
        </Link>
      </div>
    </div>
  );
}
