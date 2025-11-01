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
      console.log("📝 新しいゲストIDをSupabaseに登録:", guestId);
      await supabase.from("users").insert({
        id: guestId,  // ← PRIMARY KEY カラム名に修正
      });
      console.log("✅ ゲストID登録成功");
    } catch (err) {
      console.warn("⚠️ Supabaseへのユーザー登録に失敗しました:", err);
      // Supabaseが利用不可でもlocalStorageは使用可能
    }
  } else {
    // 既存のguestIdがSupabaseに登録されているか確認
    try {
      console.log("🔍 既存ゲストIDを確認:", guestId);
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("id", guestId)  // ← カラム名を `guest_id` から `id` に修正
        .single();

      // 登録されていなければ登録
      if (!data) {
        console.log("📝 既存ゲストIDをSupabaseに登録:", guestId);
        await supabase.from("users").insert({
          id: guestId,  // ← PRIMARY KEY カラム名に修正
        });
        console.log("✅ 既存ゲストID登録成功");
      } else {
        console.log("✅ ゲストIDは既に登録済み");
      }
    } catch (err) {
      console.warn("⚠️ Supabaseユーザー確認/登録に失敗しました:", err);
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
