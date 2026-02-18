/**
 * PASSO 38 - Login/Auth UI Components
 * Simple authentication components for email/password and magic link login
 */

import React, { useState } from "react";
import {
  loginWithEmail,
  signupWithEmail,
  sendMagicLoginLink,
  loginWithMagicLink,
  getCurrentUser,
  logout as authLogout
} from "../core/auth/AuthProvider";
import { User } from "../models/User";
import "../styles/auth.css";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onLoginSuccess, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginWithEmail(email, password);
      
      if (response.success && response.session) {
        onLoginSuccess(response.session.user);
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await sendMagicLoginLink(email);
      
      if (response.success) {
        setMagicLinkSent(true);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to send magic link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to NutriPilot</h2>
        <p className="auth-subtitle">
          {useMagicLink 
            ? "Enter your email to receive a magic login link" 
            : "Log in to access your meal plans"}
        </p>

        {magicLinkSent ? (
          <div className="magic-link-sent">
            <h3>✉️ Check your email!</h3>
            <p>We've sent a magic login link to <strong>{email}</strong></p>
            <p className="dev-note">
              📋 <strong>Development Mode:</strong> Check the browser console for the magic link
            </p>
            <button 
              className="btn-secondary"
              onClick={() => {
                setMagicLinkSent(false);
                setUseMagicLink(false);
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={useMagicLink ? handleMagicLinkRequest : handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            {!useMagicLink && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : (useMagicLink ? "Send Magic Link" : "Log In")}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setUseMagicLink(!useMagicLink)}
              disabled={loading}
            >
              {useMagicLink ? "Use Password Instead" : "Use Magic Link"}
            </button>

            {onSwitchToSignup && (
              <p className="auth-switch">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={onSwitchToSignup}
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

interface SignupProps {
  onSignupSuccess: (user: User) => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await signupWithEmail(email, password, displayName);
      
      if (response.success && response.session) {
        onSignupSuccess(response.session.user);
      } else {
        setError(response.error || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred during signup");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join NutriPilot and start meal planning</p>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="displayName">Name (optional)</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={loading}
              minLength={6}
            />
            <small className="form-hint">Minimum 6 characters</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {onSwitchToLogin && (
            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Log in
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

interface MagicLinkVerifyProps {
  token: string;
  onVerifySuccess: (user: User) => void;
  onVerifyError: (error: string) => void;
}

export function MagicLinkVerify({ token, onVerifySuccess, onVerifyError }: MagicLinkVerifyProps) {
  const [verifying, setVerifying] = useState(true);

  React.useEffect(() => {
    async function verify() {
      try {
        const response = await loginWithMagicLink(token);
        
        if (response.success && response.session) {
          onVerifySuccess(response.session.user);
        } else {
          onVerifyError(response.error || "Invalid magic link");
        }
      } catch (err) {
        onVerifyError("Failed to verify magic link");
        console.error(err);
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token, onVerifySuccess, onVerifyError]);

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verifying...</h2>
          <p>Please wait while we log you in</p>
        </div>
      </div>
    );
  }

  return null;
}

interface AuthContainerProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export function AuthContainer({ children, user, onLogout }: AuthContainerProps) {
  if (!user) {
    return null;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <div className="user-info">
          <span className="user-name">{user.displayName || user.email}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Log Out
        </button>
      </div>
      <div className="auth-content">
        {children}
      </div>
    </div>
  );
}

// Main Auth component that handles the auth flow
export function Auth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <SignupForm 
        onSignupSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <LoginForm 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <AuthContainer user={user} onLogout={handleLogout}>
      {children}
    </AuthContainer>
  );
}
