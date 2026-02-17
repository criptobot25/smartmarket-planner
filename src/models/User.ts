/**
 * PASSO 38 - Authentication & Cloud Sync Foundation
 * User models and authentication types
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  magicLinkToken?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
}

export interface LoginResponse {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

export interface SignupData {
  email: string;
  password: string;
  displayName?: string;
}

export type AuthProvider = "email" | "magic-link" | "google" | "github";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}
