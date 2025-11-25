export interface User {
  email: string;
  name: string;
  avatar: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

