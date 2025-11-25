export interface User {
  id?: number;
  email: string;
  name?: string;
  avatar?: string;
  nickname?: string;
  age?: number;
  country?: string;
  gender?: string;
  categories?: string[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProfileData {
  nickname?: string;
  age?: number;
  country?: string;
  gender?: string;
  categories?: string[];
}

export interface PreferencesData {
  target_age_min?: number;
  target_age_max?: number;
  target_country?: string;
  target_gender?: string;
  target_categories?: string[];
}

export interface MatchedUser {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  nickname?: string;
  age?: number;
  country?: string;
  gender?: string;
  categories?: string[];
}

export interface MatchingStatus {
  status: 'idle' | 'waiting' | 'matched';
  session_id?: number;
  matched_user?: MatchedUser;
  similarity_score?: number;
}

export interface MatchingJoinResponse {
  status: 'waiting' | 'matched' | 'error';
  message: string;
  session_id?: number;
  matched_user?: MatchedUser;
  similarity_score?: number;
}

export interface MatchingLeaveResponse {
  status: string;
  message: string;
}

