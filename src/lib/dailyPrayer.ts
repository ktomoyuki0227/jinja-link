import { supabase } from "./supabase";
import { DailyPrayerStatus } from "@/types";

// 本日の日付（YYYY-MM-DD）を取得
export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// 前日の日付を取得
export function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// ボーナスポイント（固定値）
export const DAILY_PRAYER_BONUS = 10;

/**
 * 本日のおつとめ状態を確認
 * Supabaseから最新情報を取得し、localStorage のフォールバック
 */
export async function checkDailyPrayerStatus(
  guestId: string
): Promise<DailyPrayerStatus> {
  const today = getTodayString();
  const cacheKey = `omamori_prayer_${today}`;

  try {
    // Supabase から確認
    const { data, error } = await supabase
      .from("prayer_tracker")
      .select("*")
      .eq("guest_id", guestId)
      .eq("prayer_date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = No rows found (正常)
      console.error("おつとめ状態確認エラー:", error);
    }

    const hasPrayed = !!data && !!data.completed_at;

    if (hasPrayed) {
      // localStorage にキャッシュ
      localStorage.setItem(cacheKey, "true");
    }

    return {
      has_prayed_today: hasPrayed,
      bonus_points: DAILY_PRAYER_BONUS,
      last_prayer_date: data ? data.prayer_date : null,
    };
  } catch (err) {
    console.warn("Supabase確認失敗、localStorageを使用:", err);
    // Supabase 失敗時は localStorage にフォールバック
    const cached = localStorage.getItem(cacheKey);
    return {
      has_prayed_today: cached === "true",
      bonus_points: DAILY_PRAYER_BONUS,
      last_prayer_date: null,
    };
  }
}

/**
 * 本日のおつとめを完了記録
 * Supabase と donation_logs に記録
 */
export async function completeDailyPrayer(
  guestId: string,
  shrineId: string
): Promise<{ success: boolean; totalPoints?: number; error?: string }> {
  const today = getTodayString();

  try {
    // 1. prayer_tracker に記録
    const { error: trackerError } = await supabase
      .from("prayer_tracker")
      .insert({
        guest_id: guestId,
        prayer_date: today,
        bonus_points: DAILY_PRAYER_BONUS,
        completed_at: new Date().toISOString(),
      });

    if (trackerError) {
      console.error("prayer_tracker 記録エラー:", trackerError);
      throw trackerError;
    }

    // 2. donation_logs にボーナスポイント を記録
    const { error: donationError } = await supabase
      .from("donation_logs")
      .insert({
        guest_id: guestId,
        shrine_id: shrineId,
        point: DAILY_PRAYER_BONUS,
        event_type: "daily_prayer_bonus",
      });

    if (donationError) {
      console.error("donation_logs 記録エラー:", donationError);
      throw donationError;
    }

    // 3. localStorage にキャッシュ
    const cacheKey = `omamori_prayer_${today}`;
    localStorage.setItem(cacheKey, "true");

    return { success: true, totalPoints: DAILY_PRAYER_BONUS };
  } catch (err) {
    console.error("おつとめ完了処理エラー:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * モーダル表示フラグの管理（セッション内）
 */
export function shouldShowDailyPrayerModal(): boolean {
  const sessionKey = "omamori_daily_prayer_shown_today";
  const today = getTodayString();
  const cachedDate = sessionStorage.getItem(sessionKey);

  // 本日表示済みならスキップ
  if (cachedDate === today) {
    return false;
  }

  return true;
}

export function markDailyPrayerModalShown(): void {
  const sessionKey = "omamori_daily_prayer_shown_today";
  const today = getTodayString();
  sessionStorage.setItem(sessionKey, today);
}
