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
    console.log("📨 送信開始:", userMessage);  // ← デバッグログ
    if (!userMessage.trim()) return;

    try {
      setIsSending(true);

      // AI応答を生成（IO.Intelligence API を使用）
      const aiReply = await generateAIResponse(userMessage);
      console.log("🤖 AI応答生成完了:", aiReply);  // ← デバッグログ

      // Supabase に保存
      const { error } = await supabase.from("chat_logs").insert({
        guest_id: guestId,
        oshigami_id: oshigami.id,
        user_message: userMessage,
        ai_reply: aiReply,
        // emotion: "neutral",  ← 削除（テーブルに存在しないため）
      });

      if (error) {
        console.error("❌ メッセージ保存エラー:", error);
        return;
      }
      
      console.log("💾 Supabase保存完了");  // ← デバッグログ

      // 画面に反映 - 保存後、チャット履歴を再取得
      const newMessage = {
        id: Date.now().toString(),
        guest_id: guestId,
        oshigami_id: oshigami.id,
        user_message: userMessage,
        ai_reply: aiReply,
        created_at: new Date().toISOString(),
      };
      
      console.log("📱 画面に追加するメッセージ:", newMessage);  // ← デバッグログ
      
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        console.log("✅ メッセージ更新完了。現在のメッセージ数:", updated.length);  // ← デバッグログ
        return updated;
      });
    } catch (err) {
      console.error("❌ メッセージ送信エラー:", err);
    } finally {
      setIsSending(false);
    }
  };

  // AI応答生成関数
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log("🔄 AI応答生成開始:", { oshigamiName: oshigami.name, personality: oshigami.personality });
      
      // APIキー確認
      if (!envConfig.ioIntelligenceApiKey || !envConfig.ioIntelligenceApiUrl) {
        console.warn("⚠️ IO.Intelligence APIが未設定です。モック応答を使用します。");
        return getMockResponse(oshigami.personality);
      }
      
      // システムプロンプト: 推し神のキャラクター性を指定
      const systemPrompt = `あなたは「${oshigami.name}」という神社の神です。以下の性格で、ユーザーの質問や相談に対して応答してください：

${oshigami.personality}

重要なガイドライン：
- 日本語で、親切かつ自然な言葉遣いで応答してください
- 短すぎず、長すぎない回答（1-3文程度が目安）
- ユーザーの具体的な状況や内容に対して、その性格らしい応答をしてください
- 相手を尊重し、前向きかつ建設的な対応を心がけてください`;

      // IO.Intelligence API を呼び出し
      console.log("📡 API呼び出し:", `${envConfig.ioIntelligenceApiUrl}/v1/chat/completions`);
      
      const response = await fetch(
        `${envConfig.ioIntelligenceApiUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${envConfig.ioIntelligenceApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 256,
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        // フォールバック: モック応答
        return getMockResponse(oshigami.personality);
      }

      const result = await response.json();
      console.log("✅ API応答取得:", result);
      
      // チャット完了形式の応答を処理
      if (result.choices && result.choices[0] && result.choices[0].message) {
        const aiReply = result.choices[0].message.content?.trim() || "";
        if (aiReply) {
          console.log("🤖 AI返答:", aiReply);
          return aiReply;
        }
      }
      
      // フォールバック: モック応答
      console.warn("⚠️ API応答が予期した形式ではありません。モック応答を使用します。");
      return getMockResponse(oshigami.personality);
    } catch (err) {
      console.error("❌ AI応答生成エラー:", err);
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
        "その勇気を大切にしてください。きっと道は開けます。",
        "チャレンジすることが何より大切です。応援しています！",
      ],
      "優しく寄り添い、心を落ち着かせる。": [
        "そうなんですね。それは大変でしたね。",
        "あなたの気持ちをお聞かせください。",
        "ゆっくりでいいんですよ。焦らなくて大丈夫です。",
        "そういう時もあります。今はゆっくり休んでください。",
        "あなたの気持ちは大切です。一人じゃありませんよ。",
      ],
      "知識を広げることを勧める。知的好奇心を刺激する。": [
        "それは興味深いですね。もっと詳しく知ってみませんか？",
        "こういう視点もありますよ。",
        "勉強は素晴らしいことです。知識は財産ですから。",
        "その好奇心を大切にしましょう。新しい発見があります。",
        "もっと深く掘り下げると、新しい世界が見えてきますよ。",
      ],
      "ロマンティックで前向き。幸せを応援する。": [
        "素敵ですね！幸せになってください！",
        "そういう時間って大切ですよね。",
        "あなたの幸せを心から応援しています。",
        "人生を楽しむことが一番大切です。素晴らしい。",
        "その気持ちを大事にして、人生を輝かせてください。",
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
