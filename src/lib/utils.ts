import { v4 as uuidv4 } from "uuid";

/**
 * ゲストIDを生成する
 */
export function generateGuestId(): string {
  return uuidv4();
}

/**
 * localStorageからゲストIDを取得する、なければ生成する
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return generateGuestId();
  }

  const key = "omamori_guest_id";
  let guestId = localStorage.getItem(key);

  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(key, guestId);
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
