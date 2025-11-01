import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";

/**
 * ゲストIDを生成する
 */
export function generateGuestId(): string {
  return uuidv4();
}

/**
 * localStorageからゲストIDを取得する、なければ生成してSupabaseに登録する
 * Supabaseが利用不可の場合はlocalStorageのみを使用
 */
export async function getOrCreateGuestId(): Promise<string> {
  if (typeof window === "undefined") {
    return generateGuestId();
  }

  const key = "omamori_guest_id";
  let guestId = localStorage.getItem(key);

  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(key, guestId);

    // Supabaseに登録（エラーハンドリング付き）
    try {
      console.log("📝 新規ユーザーをSupabaseに登録:", guestId);
      const { data, error } = await supabase.from("users").insert({
        id: guestId,
      }).select();
      
      if (error) {
        console.error("❌ Supabaseへのユーザー登録に失敗:", error.message);
        console.error("エラー詳細:", error);
        throw error;
      } else {
        console.log("✅ Supabaseへのユーザー登録成功:", data);
      }
    } catch (err) {
      console.error("🔴 Supabaseへのユーザー登録に失敗しました:", err);
      // Supabaseが利用不可でもlocalStorageは使用可能
      return guestId;
    }
  } else {
    // 既存のguestIdがSupabaseに登録されているか確認
    try {
      console.log("🔍 既存ユーザーをSupabaseで確認:", guestId);
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", guestId)
        .single();

      // データベースエラー（404以外）の場合
      if (error && error.code !== 'PGRST116') {
        console.error("⚠️ Supabase照会エラー:", error.message);
        return guestId;
      }

      // 登録されていなければ登録
      if (!data) {
        console.log("📝 既存ユーザーをSupabaseに登録:", guestId);
        const { error: insertError } = await supabase.from("users").insert({
          id: guestId,
        }).select();
        
        if (insertError) {
          console.error("❌ ユーザー登録に失敗:", insertError.message);
          throw insertError;
        }
        console.log("✅ 既存ユーザーのSupabase登録成功");
      } else {
        console.log("✅ ユーザーは既にSupabaseに登録済み:", data);
      }
    } catch (err) {
      console.error("🔴 Supabaseユーザー確認/登録に失敗しました:", err);
      // エラーが発生してもguestIdは返す（localStorageベース）
    }
  }

  return guestId;
}

/**
 * localStorageをクリア（開発用）
 */
export function clearGuestId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("omamori_guest_id");
  }
}

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * APIレスポンスのチェック
 */
export async function checkResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
}

/**
 * 日時フォーマット
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 数値フォーマット
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ja-JP").format(num);
}
