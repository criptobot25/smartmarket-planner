import { describe, it, expect, beforeEach } from "vitest";
import {
  LocalAuthProvider,
  getAuthProvider,
  setAuthProvider,
  resetAuthProvider,
  loginWithEmail,
  signupWithEmail,
  sendMagicLoginLink,
  getCurrentUser,
  logout,
  isLoggedIn
} from "../core/auth/AuthProvider";

describe("PASSO 38 - Authentication & Cloud Sync", () => {
  let provider: LocalAuthProvider;

  beforeEach(() => {
    provider = new LocalAuthProvider();
    provider.clearAllData();
    resetAuthProvider();
  });

  describe("1. User Signup", () => {
    it("should create new user account", async () => {
      const response = await provider.signup({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User"
      });

      expect(response.success).toBe(true);
      expect(response.session).toBeDefined();
      expect(response.session?.user.email).toBe("test@example.com");
      expect(response.session?.user.displayName).toBe("Test User");
      expect(response.session?.user.id).toBeTruthy();
    });

    it("should reject signup with short password", async () => {
      const response = await provider.signup({
        email: "test@example.com",
        password: "123"
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("6 characters");
    });

    it("should reject duplicate email", async () => {
      await provider.signup({
        email: "test@example.com",
        password: "password123"
      });

      const response = await provider.signup({
        email: "test@example.com",
        password: "differentpass"
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("already exists");
    });

    it("should auto-generate display name from email", async () => {
      const response = await provider.signup({
        email: "john.doe@example.com",
        password: "password123"
      });

      expect(response.success).toBe(true);
      expect(response.session?.user.displayName).toBe("john.doe");
    });
  });

  describe("2. Email/Password Login", () => {
    beforeEach(async () => {
      await provider.signup({
        email: "user@example.com",
        password: "mypassword",
        displayName: "Test User"
      });
      await provider.logout();
    });

    it("should login with correct credentials", async () => {
      const response = await provider.login({
        email: "user@example.com",
        password: "mypassword"
      });

      expect(response.success).toBe(true);
      expect(response.session).toBeDefined();
      expect(response.session?.user.email).toBe("user@example.com");
    });

    it("should reject login with wrong password", async () => {
      const response = await provider.login({
        email: "user@example.com",
        password: "wrongpassword"
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("Invalid password");
    });

    it("should reject login for non-existent user", async () => {
      const response = await provider.login({
        email: "nonexistent@example.com",
        password: "anypassword"
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("not found");
    });

    it("should be case-insensitive for email", async () => {
      const response = await provider.login({
        email: "USER@EXAMPLE.COM",
        password: "mypassword"
      });

      expect(response.success).toBe(true);
      expect(response.session?.user.email).toBe("user@example.com");
    });
  });

  describe("3. Magic Link Authentication", () => {
    it("should send magic link", async () => {
      const response = await provider.sendMagicLink({
        email: "magic@example.com"
      });

      expect(response.success).toBe(true);
      expect(response.emailSent).toBe(true);
      expect(response.message).toBeTruthy();
    });

    it("should verify magic link and login", async () => {
      // Send magic link
      await provider.sendMagicLink({ email: "magic@example.com" });

      // Get the token from localStorage (in prod, this comes from email)
      const magicLinks = JSON.parse(localStorage.getItem("smartmarket_magic_links") || "{}");
      const token = magicLinks["magic@example.com"]?.token;

      expect(token).toBeTruthy();

      // Verify token
      const response = await provider.verifyMagicLink(token);

      expect(response.success).toBe(true);
      expect(response.session).toBeDefined();
      expect(response.session?.user.email).toBe("magic@example.com");
    });

    it("should auto-create user with magic link", async () => {
      await provider.sendMagicLink({ email: "newuser@example.com" });

      const magicLinks = JSON.parse(localStorage.getItem("smartmarket_magic_links") || "{}");
      const token = magicLinks["newuser@example.com"]?.token;

      const response = await provider.verifyMagicLink(token);

      expect(response.success).toBe(true);
      expect(response.session?.user.email).toBe("newuser@example.com");
      expect(response.session?.user.displayName).toBe("newuser");
    });

    it("should reject expired magic link", async () => {
      await provider.sendMagicLink({ email: "test@example.com" });

      // Manually expire the link
      const magicLinks = JSON.parse(localStorage.getItem("smartmarket_magic_links") || "{}");
      const token = magicLinks["test@example.com"]?.token;
      magicLinks["test@example.com"].expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem("smartmarket_magic_links", JSON.stringify(magicLinks));

      const response = await provider.verifyMagicLink(token);

      expect(response.success).toBe(false);
      expect(response.error).toContain("expired");
    });

    it("should reject invalid token", async () => {
      const response = await provider.verifyMagicLink("invalid-token-xyz");

      expect(response.success).toBe(false);
      expect(response.error).toContain("Invalid");
    });
  });

  describe("4. Session Management", () => {
    beforeEach(async () => {
      await provider.signup({
        email: "session@example.com",
        password: "password123"
      });
    });

    it("should maintain session after login", async () => {
      const session = await provider.getSession();
      expect(session).toBeDefined();
      expect(session?.user.email).toBe("session@example.com");
    });

    it("should get current user", async () => {
      const user = await provider.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe("session@example.com");
    });

    it("should report authenticated status", async () => {
      const isAuth = await provider.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it("should get auth state", async () => {
      const state = await provider.getAuthState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.session).toBeDefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should clear session on logout", async () => {
      await provider.logout();

      const session = await provider.getSession();
      const user = await provider.getCurrentUser();
      const isAuth = await provider.isAuthenticated();

      expect(session).toBeNull();
      expect(user).toBeNull();
      expect(isAuth).toBe(false);
    });

    it("should persist session across page reloads", async () => {
      // Create new provider instance (simulates reload)
      const newProvider = new LocalAuthProvider();

      const user = await newProvider.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe("session@example.com");
    });

    it("should refresh session", async () => {
      const oldSession = await provider.getSession();
      const oldToken = oldSession?.token;

      const newSession = await provider.refreshSession();

      expect(newSession).toBeDefined();
      expect(newSession?.token).not.toBe(oldToken);
      expect(newSession?.user.email).toBe("session@example.com");
    });
  });

  describe("5. Session Expiration", () => {
    it("should reject expired session", async () => {
      await provider.signup({
        email: "expire@example.com",
        password: "password123"
      });

      // Manually expire session
      const sessionData = localStorage.getItem("smartmarket_auth_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.expiresAt = new Date(Date.now() - 1000).toISOString();
        localStorage.setItem("smartmarket_auth_session", JSON.stringify(session));
      }

      // Create new provider to reload session
      const newProvider = new LocalAuthProvider();
      const user = await newProvider.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe("6. Helper Functions", () => {
    it("should use global provider for signup", async () => {
      const response = await signupWithEmail("global@example.com", "password123");
      expect(response.success).toBe(true);
    });

    it("should use global provider for login", async () => {
      await signupWithEmail("login@example.com", "password123");
      await logout();

      const response = await loginWithEmail("login@example.com", "password123");
      expect(response.success).toBe(true);
    });

    it("should use global provider for magic link", async () => {
      const response = await sendMagicLoginLink("magic@example.com");
      expect(response.success).toBe(true);
    });

    it("should use global provider for current user", async () => {
      await signupWithEmail("current@example.com", "password123");
      const user = await getCurrentUser();
      expect(user?.email).toBe("current@example.com");
    });

    it("should use global provider for logout", async () => {
      await signupWithEmail("logout@example.com", "password123");
      await logout();

      const isAuth = await isLoggedIn();
      expect(isAuth).toBe(false);
    });
  });

  describe("7. Provider Singleton", () => {
    it("should get default provider", () => {
      const provider = getAuthProvider();
      expect(provider).toBeDefined();
    });

    it("should allow setting custom provider", () => {
      const customProvider = new LocalAuthProvider();
      setAuthProvider(customProvider);

      const retrieved = getAuthProvider();
      expect(retrieved).toBe(customProvider);
    });

    it("should reset to default provider", () => {
      const customProvider = new LocalAuthProvider();
      setAuthProvider(customProvider);
      resetAuthProvider();

      const provider = getAuthProvider();
      expect(provider).not.toBe(customProvider);
    });
  });

  describe("8. Data Persistence", () => {
    it("should store user data in localStorage", async () => {
      await provider.signup({
        email: "store@example.com",
        password: "password123"
      });

      const usersData = localStorage.getItem("smartmarket_users");
      expect(usersData).toBeTruthy();

      const users = JSON.parse(usersData!);
      expect(users.length).toBeGreaterThan(0);
      expect(users.some((u: any) => u.email === "store@example.com")).toBe(true);
    });

    it("should clear all auth data", async () => {
      await provider.signup({
        email: "clear@example.com",
        password: "password123"
      });

      provider.clearAllData();

      const session = await provider.getSession();
      const users = localStorage.getItem("smartmarket_users");

      expect(session).toBeNull();
      expect(users).toBeNull();
    });
  });

  describe("9. Edge Cases", () => {
    it("should handle missing email", async () => {
      const response = await provider.login({
        email: "",
        password: "password"
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("required");
    });

    it("should handle missing password", async () => {
      const response = await provider.login({
        email: "test@example.com",
        password: ""
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain("required");
    });

    it("should handle special characters in email", async () => {
      const response = await provider.signup({
        email: "user+tag@example.com",
        password: "password123"
      });

      expect(response.success).toBe(true);
      expect(response.session?.user.email).toBe("user+tag@example.com");
    });
  });

  describe("10. Real-World Authentication Flows", () => {
    it("should support complete signup → logout → login flow", async () => {
      // Signup
      const signup = await provider.signup({
        email: "flow@example.com",
        password: "password123",
        displayName: "Flow User"
      });
      expect(signup.success).toBe(true);

      // Verify logged in
      let isAuth = await provider.isAuthenticated();
      expect(isAuth).toBe(true);

      // Logout
      await provider.logout();
      isAuth = await provider.isAuthenticated();
      expect(isAuth).toBe(false);

      // Login again
      const login = await provider.login({
        email: "flow@example.com",
        password: "password123"
      });
      expect(login.success).toBe(true);
      expect(login.session?.user.displayName).toBe("Flow User");
    });

    it("should support magic link for existing user", async () => {
      // Create user with password
      await provider.signup({
        email: "both@example.com",
        password: "password123"
      });

      await provider.logout();

      // Login with magic link
      await provider.sendMagicLink({ email: "both@example.com" });
      const magicLinks = JSON.parse(localStorage.getItem("smartmarket_magic_links") || "{}");
      const token = magicLinks["both@example.com"]?.token;

      const response = await provider.verifyMagicLink(token);
      expect(response.success).toBe(true);
      expect(response.session?.user.email).toBe("both@example.com");
    });
  });
});
