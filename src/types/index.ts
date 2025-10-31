// User & Auth Types
export interface GuestUser {
  guest_id: string;
  oshigami_id?: string;
  total_points: number;
  created_at: string;
}

// Oshigami (推し神) Types
export interface Oshigami {
  id: string;
  name: string;
  personality_prompt: string;
  blessing_type: string;
  image_url: string;
  created_at: string;
}

// Shrine Types
export interface Shrine {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  verified: boolean;
  created_at: string;
}

// Donation Log Types
export interface DonationLog {
  id: string;
  guest_id: string;
  shrine_id: string;
  point: number;
  event_type: string;
  created_at: string;
}

// Chat Log Types
export interface ChatLog {
  id: string;
  guest_id: string;
  oshigami_id: string;
  user_message: string;
  ai_reply: string;
  emotion: string;
  created_at: string;
}

// Daily Prayer Types
export interface DailyPrayerTracker {
  id: string;
  guest_id: string;
  prayer_date: string; // YYYY-MM-DD format
  bonus_points: number;
  completed_at: string | null;
  created_at: string;
}

export interface DailyPrayerStatus {
  has_prayed_today: boolean;
  bonus_points: number;
  last_prayer_date: string | null;
}
// Intelligence Results Types
export interface IntelligenceResult {
  id: string;
  guest_id: string;
  analysis_type: string;
  result_json: Record<string, unknown>;
  created_at: string;
}

// AI Chat Request/Response Types
export interface AIChatRequest {
  guest_id: string;
  prompt: string;
  oshigami_id: string;
  shrine_id?: string;
}

export interface AIChatResponse {
  success: boolean;
  data?: {
    reply: string;
    emotion: string;
    blessing?: string;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Donation Request/Response Types
export interface DonationRequest {
  guest_id: string;
  shrine_id: string;
  point: number;
  event_type: string;
}

export interface DonationResponse {
  success: boolean;
  data?: {
    donation_id: string;
    total_points: number;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Intelligence Request/Response Types
export interface IntelligenceRequest {
  guest_id: string;
  analysis_type: string;
}

export interface IntelligenceResponse {
  success: boolean;
  data?: {
    top_shrine: string;
    growth_rate: number;
    retention: number;
    active_hours: string[];
    recommendations: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

// Error Types
export type ErrorCode =
  | "INVALID_GUEST_ID"
  | "API_RATE_LIMIT"
  | "IO_ERROR"
  | "DATABASE_ERROR"
  | "VALIDATION_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
