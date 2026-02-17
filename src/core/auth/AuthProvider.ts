/**
 * PASSO 38 - Authentication Provider Abstraction
 * 
 * Supports:
 * - Email/Password authentication
 * - Magic link authentication
 * - LocalStorage session management
 * - Future: Cloud backend integration (Firebase, Supabase, custom API)
 */

import {
  User,
  AuthCredentials,
  AuthSession,
  MagicLinkRequest,
  MagicLinkResponse,
  LoginResponse,
  SignupData,
  AuthState
} from "../../models/User";

// ============================================================================
// Authentication Provider Interface
// ============================================================================

export interface IAuthProvider {
  // Authentication
  login(credentials: AuthCredentials): Promise<LoginResponse>;
  signup(data: SignupData): Promise<LoginResponse>;
  logout(): Promise<void>;
  
  // Magic Link
  sendMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse>;
  verifyMagicLink(token: string): Promise<LoginResponse>;
  
  // Session Management
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession | null>;
  
  // State
  isAuthenticated(): Promise<boolean>;
  getAuthState(): Promise<AuthState>;
}

// ============================================================================
// Local Authentication Provider (localStorage-based)
// ============================================================================

export class LocalAuthProvider implements IAuthProvider {
  private static readonly STORAGE_KEYS = {
    SESSION: "smartmarket_auth_session",
    USERS: "smartmarket_users"
  };

  private currentSession: AuthSession | null = null;

  constructor() {
    this.loadSession();
  }

  // ========================================================================
  // Email/Password Authentication
  // ========================================================================

  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    if (!password) {
      return { success: false, error: "Password is required" };
    }

    // Get stored users
    const users = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // In a real system, this would verify hashed password
    // For local demo, we just check if password exists
    const storedPassword = this.getStoredPassword(user.id);
    if (storedPassword !== password) {
      return { success: false, error: "Invalid password" };
    }

    // Update last login
    user.lastLoginAt = new Date();
    this.updateStoredUser(user);

    // Create session
    const session = this.createSession(user);
    this.saveSession(session);

    return { success: true, session };
  }

  async signup(data: SignupData): Promise<LoginResponse> {
    const { email, password, displayName } = data;

    if (!email) {
      return { success: false, error: "Email is required" };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Check if user already exists
    const users = this.getStoredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    // Create new user
    const user: User = {
      id: this.generateUserId(),
      email,
      displayName: displayName || email.split("@")[0],
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    // Store user and password
    users.push(user);
    this.saveUsers(users);
    this.savePassword(user.id, password);

    // Create session
    const session = this.createSession(user);
    this.saveSession(session);

    return { success: true, session };
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    localStorage.removeItem(LocalAuthProvider.STORAGE_KEYS.SESSION);
  }

  // ========================================================================
  // Magic Link Authentication
  // ========================================================================

  async sendMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    const { email } = request;

    if (!email) {
      return {
        success: false,
        message: "Email is required",
        emailSent: false
      };
    }

    // Generate magic link token
    const token = this.generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token temporarily
    const magicLinks = this.getMagicLinks();
    magicLinks[email] = { token, expiresAt: expiresAt.toISOString() };
    this.saveMagicLinks(magicLinks);

    // In production, send email via backend
    console.log(`[Magic Link] Email: ${email}, Token: ${token}`);
    console.log(`[Magic Link] Link: ${window.location.origin}/auth/magic?token=${token}`);

    return {
      success: true,
      message: "Magic link sent! Check console for development link.",
      emailSent: true
    };
  }

  async verifyMagicLink(token: string): Promise<LoginResponse> {
    const magicLinks = this.getMagicLinks();

    // Find email for this token
    let userEmail: string | null = null;
    for (const [email, data] of Object.entries(magicLinks)) {
      if (data.token === token) {
        // Check if expired
        if (new Date() > new Date(data.expiresAt)) {
          return { success: false, error: "Magic link expired" };
        }
        userEmail = email;
        break;
      }
    }

    if (!userEmail) {
      return { success: false, error: "Invalid magic link" };
    }

    // Get or create user
    let user = this.getStoredUsers().find(u => u.email === userEmail);
    
    if (!user) {
      // Auto-create user for magic link
      user = {
        id: this.generateUserId(),
        email: userEmail,
        displayName: userEmail.split("@")[0],
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
      const users = this.getStoredUsers();
      users.push(user);
      this.saveUsers(users);
    } else {
      user.lastLoginAt = new Date();
      this.updateStoredUser(user);
    }

    // Clear used magic link
    delete magicLinks[userEmail];
    this.saveMagicLinks(magicLinks);

    // Create session
    const session = this.createSession(user);
    this.saveSession(session);

    return { success: true, session };
  }

  // ========================================================================
  // Session Management
  // ========================================================================

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async getSession(): Promise<AuthSession | null> {
    if (this.currentSession) {
      // Check if expired
      if (new Date() > this.currentSession.expiresAt) {
        await this.logout();
        return null;
      }
      return this.currentSession;
    }
    return null;
  }

  async refreshSession(): Promise<AuthSession | null> {
    const currentSession = await this.getSession();
    if (!currentSession) {
      return null;
    }

    // Extend session
    const newSession = this.createSession(currentSession.user);
    this.saveSession(newSession);
    return newSession;
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  async getAuthState(): Promise<AuthState> {
    const session = await this.getSession();
    return {
      isAuthenticated: session !== null,
      user: session?.user || null,
      session,
      loading: false,
      error: null
    };
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private createSession(user: User): AuthSession {
    return {
      user,
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private loadSession(): void {
    try {
      const sessionData = localStorage.getItem(LocalAuthProvider.STORAGE_KEYS.SESSION);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Restore Date objects
        session.user.createdAt = new Date(session.user.createdAt);
        session.user.lastLoginAt = new Date(session.user.lastLoginAt);
        session.expiresAt = new Date(session.expiresAt);
        
        // Check if expired
        if (new Date() <= session.expiresAt) {
          this.currentSession = session;
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  }

  private saveSession(session: AuthSession): void {
    this.currentSession = session;
    localStorage.setItem(LocalAuthProvider.STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  private getStoredUsers(): User[] {
    try {
      const data = localStorage.getItem(LocalAuthProvider.STORAGE_KEYS.USERS);
      if (data) {
        const users = JSON.parse(data);
        // Restore Date objects
        return users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          lastLoginAt: new Date(u.lastLoginAt)
        }));
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
    return [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(LocalAuthProvider.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private updateStoredUser(user: User): void {
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
      this.saveUsers(users);
    }
  }

  private savePassword(userId: string, password: string): void {
    // In production, this would hash the password
    localStorage.setItem(`smartmarket_pwd_${userId}`, password);
  }

  private getStoredPassword(userId: string): string | null {
    return localStorage.getItem(`smartmarket_pwd_${userId}`);
  }

  private getMagicLinks(): Record<string, { token: string; expiresAt: string }> {
    try {
      const data = localStorage.getItem("smartmarket_magic_links");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveMagicLinks(links: Record<string, { token: string; expiresAt: string }>): void {
    localStorage.setItem("smartmarket_magic_links", JSON.stringify(links));
  }

  private generateUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateMagicLinkToken(): string {
    return `magic-${Date.now()}-${Math.random().toString(36).substr(2, 20)}`;
  }

  // For testing
  clearAllData(): void {
    localStorage.removeItem(LocalAuthProvider.STORAGE_KEYS.SESSION);
    localStorage.removeItem(LocalAuthProvider.STORAGE_KEYS.USERS);
    localStorage.removeItem("smartmarket_magic_links");
    // Clear all passwords
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("smartmarket_pwd_")) {
        localStorage.removeItem(key);
      }
    });
    this.currentSession = null;
  }
}

// ============================================================================
// Remote Authentication Provider (Future: Firebase, Supabase, etc.)
// ============================================================================

export class RemoteAuthProvider implements IAuthProvider {
  private _apiUrl: string; // Reserved for future API implementation
  private localFallback: LocalAuthProvider;

  constructor(apiUrl: string = "https://api.smartmarket.com") {
    this._apiUrl = apiUrl;
    this.localFallback = new LocalAuthProvider();
  }

  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    console.warn("[RemoteAuth] Remote authentication not yet implemented, using local fallback");
    return this.localFallback.login(credentials);
  }

  async signup(data: SignupData): Promise<LoginResponse> {
    console.warn("[RemoteAuth] Remote signup not yet implemented, using local fallback");
    return this.localFallback.signup(data);
  }

  async logout(): Promise<void> {
    console.warn("[RemoteAuth] Remote logout not yet implemented, using local fallback");
    return this.localFallback.logout();
  }

  async sendMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    console.warn("[RemoteAuth] Remote magic link not yet implemented, using local fallback");
    return this.localFallback.sendMagicLink(request);
  }

  async verifyMagicLink(token: string): Promise<LoginResponse> {
    console.warn("[RemoteAuth] Remote magic link verification not yet implemented, using local fallback");
    return this.localFallback.verifyMagicLink(token);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.localFallback.getCurrentUser();
  }

  async getSession(): Promise<AuthSession | null> {
    return this.localFallback.getSession();
  }

  async refreshSession(): Promise<AuthSession | null> {
    return this.localFallback.refreshSession();
  }

  async isAuthenticated(): Promise<boolean> {
    return this.localFallback.isAuthenticated();
  }

  async getAuthState(): Promise<AuthState> {
    return this.localFallback.getAuthState();
  }
}

// ============================================================================
// Singleton Pattern
// ============================================================================

let authProviderInstance: IAuthProvider = new LocalAuthProvider();

export function getAuthProvider(): IAuthProvider {
  return authProviderInstance;
}

export function setAuthProvider(provider: IAuthProvider): void {
  authProviderInstance = provider;
}

export function resetAuthProvider(): void {
  authProviderInstance = new LocalAuthProvider();
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  return getAuthProvider().login({ email, password });
}

export async function signupWithEmail(email: string, password: string, displayName?: string): Promise<LoginResponse> {
  return getAuthProvider().signup({ email, password, displayName });
}

export async function sendMagicLoginLink(email: string): Promise<MagicLinkResponse> {
  return getAuthProvider().sendMagicLink({ email });
}

export async function loginWithMagicLink(token: string): Promise<LoginResponse> {
  return getAuthProvider().verifyMagicLink(token);
}

export async function getCurrentUser(): Promise<User | null> {
  return getAuthProvider().getCurrentUser();
}

export async function logout(): Promise<void> {
  return getAuthProvider().logout();
}

export async function isLoggedIn(): Promise<boolean> {
  return getAuthProvider().isAuthenticated();
}
