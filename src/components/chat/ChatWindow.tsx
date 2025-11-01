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

【重要な対話ガイドライン】
- 相手の気持ちや状況を理解することを最優先にしてください
- まずは共感や理解を示し、すぐにアドバイスはしません
- 返答は短く（1-2文程度）、相手の続きの話を促してください
- 返答の最後は相手に質問を投げかけ、会話を続けるようにしてください
- アドバイスが必要な場合は、相手が求めてから段階的に提供してください
- 相手をサポートする姿勢を保ちながら、相手のペースを尊重してください

【返答の例】
ユーザー：「最近、仕事がうまくいかなくて...」
良い返答：「そうなんですね。それは大変でしたね。どんなことが上手くいかなかったのですか？」
避けるべき返答：「頑張ってください。仕事が上手くいくには...（アドバイス続く）」`;

      // IO.Intelligence API を呼び出し
      console.log("📡 API呼び出し:", `${envConfig.ioIntelligenceApiUrl}/chat/completions`);
      console.log("🔑 APIキー設定状態:", envConfig.ioIntelligenceApiKey ? "設定済み" : "未設定");
      
      const response = await fetch(
        `${envConfig.ioIntelligenceApiUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${envConfig.ioIntelligenceApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.3-70B-Instruct",
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
            max_completion_tokens: 256,
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
        console.warn("⚠️ APIエラーが発生しました。モック応答にフォールバックします。");
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
      console.warn("⚠️ エラーが発生しました。モック応答にフォールバックします。");
      // フォールバック: モック応答
      return getMockResponse(oshigami.personality);
    }
  };

  // モック応答（API エラー時のフォールバック）
  const getMockResponse = (personality: string): string => {
    const responses: { [key: string]: string[] } = {
      "励ましの言葉で応援する。常にポジティブ。": [
        "そうなんですね。もっと詳しく聞かせてもらえますか？",
        "その気持ちよくわかります。何か手伝えることはありますか？",
        "そういうこともありますよね。どんなことが起こったのですか？",
        "大変でしたね。今はどんな気分ですか？",
        "あなたの気持ちを聞かせてください。何があったのですか？",
      ],
      "優しく寄り添い、心を落ち着かせる。": [
        "そうなんですね。それについてもっと話してくれませんか？",
        "そういう時もあります。どうお感じですか？",
        "ゆっくりでいいんですよ。話したければ聞きますよ。",
        "あなたの気持ちを受け止めています。何かお話ししたいことはありますか？",
        "そういう時こそ、ゆっくり話してみませんか？",
      ],
      "知識を広げることを勧める。知的好奇心を刺激する。": [
        "それは興味深いですね。どういったことに興味を持ったのですか？",
        "もっと知りたいということですね。何が気になるのですか？",
        "その視点は素晴らしい。詳しく聞かせてもらえますか？",
        "そういう考え方もありますね。どうしてそう思ったのですか？",
        "興味深いですね。その先の話も聞いてみたいです。",
      ],
      "ロマンティックで前向き。幸せを応援する。": [
        "素敵ですね。もっと聞かせてもらえませんか？",
        "そういう時間いいですね。どんな気持ちですか？",
        "素晴らしい。その時のことをもっと聞かせてください。",
        "あなたの幸せを見ていてうれしいです。どんなことがあったのですか？",
        "素敵な話ですね。もっと詳しく聞かせてもらえますか？",
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
