import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await register(
        username,
        email,
        password
      );

      localStorage.setItem(
        "revlyVerificationEmail",
        data.email
      );

      navigate("/verify-email");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          ♡
        </div>

        <h1>Join Revly 💗</h1>

        <p>
          Create your beauty community account
        </p>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister}>
          <label>Username</label>

          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                paddingRight: "45px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                background: "transparent",
                color: "#8b7e84",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Sending verification code..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?

          <button
            onClick={() => navigate("/login")}
            className="text-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}