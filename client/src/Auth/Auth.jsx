
import { useState } from "react";
import "./Auth.css";

const API_URL = "http://localhost:5000/api";

export default function Auth({ onLogin }) {
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = page === "signup";

  function switchPage(nextPage) {
    setPage(nextPage);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validate name
    if (isSignup && cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Additional signup validation
    if (isSignup) {
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter.");
        return;
      }

      if (!/[a-z]/.test(password)) {
        setError("Password must contain at least one lowercase letter.");
        return;
      }

      if (!/[0-9]/.test(password)) {
        setError("Password must contain at least one number.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }

      if (!terms) {
        setError("Please accept the terms and conditions.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const endpoint = isSignup ? "signup" : "login";

      const body = isSignup
        ? {
            name: cleanName,
            email: cleanEmail,
            password,
          }
        : {
            email: cleanEmail,
            password,
          };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isSignup) {
        // Signup creates the account, then asks the user to log in.
        setPage("login");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setTerms(false);

        setSuccess(
          "Account created successfully! Please sign in with your new account."
        );
      } else {
        // Login succeeded and the backend created a session.
        onLogin(data.user);
      }
    } catch (error) {
      console.error("Authentication error:", error);

      setError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="auth-logo">L</div>
          <span>
            Life<span className="brand-green">Budget</span>
          </span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            SMARTER MONEY MANAGEMENT
          </span>

          <h1>
            Your money.
            <br />
            Your future.
            <br />
            <span>In control.</span>
          </h1>

          <p>
            Take charge of your finances, build better habits
            and make every euro count.
          </p>

          <div className="auth-benefits">
            <div><span>✓</span> Track every transaction</div>
            <div><span>✓</span> Manage monthly budgets</div>
            <div><span>✓</span> Achieve savings goals</div>
          </div>

          <div className="auth-visual-card">
            <span>YOUR FINANCIAL JOURNEY</span>
            <strong>Small steps. Better finances.</strong>

            <div className="auth-mini-bars">
              {[35, 55, 42, 70, 60, 90, 75, 100].map(
                (height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <span className="auth-copyright">
          © 2026 LifeBudget. All rights reserved.
        </span>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-brand">
            <div className="auth-logo">L</div>
            <strong>LifeBudget</strong>
          </div>

          <div className="auth-heading">
            <span className="auth-welcome">
              {isSignup ? "GET STARTED" : "WELCOME BACK"}
            </span>

            <h2>
              {isSignup
                ? "Create your account"
                : "Sign in to LifeBudget"}
            </h2>

            <p>
              {isSignup
                ? "Create an account to start managing your money."
                : "Enter your details to access your financial dashboard."}
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {isSignup && (
              <>
                <label htmlFor="auth-name">Full name</label>

                <input
                  id="auth-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">Email address</label>

            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
              required
            />

            <div className="auth-password-label">
              <label htmlFor="auth-password">Password</label>

              {!isSignup && (
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery will be available in a future update."
                    )
                  }
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div className="auth-password-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete={
                  isSignup ? "new-password" : "current-password"
                }
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {isSignup && (
              <>
                <label htmlFor="auth-confirm">
                  Confirm password
                </label>

                <div className="auth-password-wrapper">
                  <input
                    id="auth-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => {
                      setTerms(e.target.checked);
                      setError("");
                    }}
                  />
                  <span>
                    I agree to the Terms and Privacy Policy.
                  </span>
                </label>
              </>
            )}

            {error && (
              <div className="auth-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            {success && (
              <div className="auth-success" role="status">
                {success}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : isSignup
                  ? "Create Account →"
                  : "Sign In →"}
            </button>
          </form>

          <div className="auth-switch">
            {isSignup
              ? "Already have an account?"
              : "New to LifeBudget?"}

            <button
              type="button"
              onClick={() =>
                switchPage(isSignup ? "login" : "signup")
              }
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="auth-security-note">
            <span>🔒</span>
            Your account is protected by secure server-side authentication.
          </div>
        </div>
      </section>
    </div>
  );
}
