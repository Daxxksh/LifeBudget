
import { useState } from "react";
import "./Auth.css";

export default function Auth({ onLogin }) {
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  const isSignup = page === "signup";

  function switchPage(nextPage) {
    setPage(nextPage);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (isSignup && name.trim().length < 2) {
      return setError("Please enter your full name.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (isSignup && password !== confirmPassword) {
      return setError("Your passwords do not match.");
    }

    if (isSignup && !terms) {
      return setError("Please accept the terms and conditions.");
    }

    if (!isSignup) {
      // Demo login: accepts any valid email and password.
      onLogin({
        name: email.split("@")[0],
        email,
        remember,
      });
      return;
    }

    // Demo signup: does not create a real account.
    onLogin({
      name: name.trim(),
      email,
      remember,
    });
  }

  return (
    <div className="auth-container">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="auth-logo">L</div>
          <span>Life<span className="brand-green">Budget</span></span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">SMARTER MONEY MANAGEMENT</span>

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
              {[35, 55, 42, 70, 60, 90, 75, 100].map((height, i) => (
                <div key={i} style={{ height: `${height}%` }} />
              ))}
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
              {isSignup ? "Create your account" : "Sign in to LifeBudget"}
            </h2>

            <p>
              {isSignup
                ? "Create an account to start managing your money."
                : "Enter your details to access your financial dashboard."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="auth-password-label">
              <label htmlFor="auth-password">Password</label>

              {!isSignup && (
                <button
                  type="button"
                  onClick={() =>
                    setError("Password recovery will be available after backend integration.")
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
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {isSignup && (
              <>
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  <span>I agree to the Terms and Privacy Policy.</span>
                </label>
              </>
            )}

            {!isSignup && (
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            )}

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button className="auth-submit" type="submit">
              {isSignup ? "Create Account →" : "Sign In →"}
            </button>
          </form>

          <div className="auth-switch">
            {isSignup ? "Already have an account?" : "New to LifeBudget?"}

            <button
              type="button"
              onClick={() => switchPage(isSignup ? "login" : "signup")}
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="auth-security-note">
            <span>🔒</span>
            Demo authentication. Real account security is not yet implemented.
          </div>
        </div>
      </section>
    </div>
  );
}
