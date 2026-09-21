import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/VerifyEmailPage.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();

  const {
    verifyEmail,
    resendVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(
      "revlyVerificationEmail"
    );

    if (!savedEmail) {
      navigate("/register");
      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await verifyEmail(email, otp);

      localStorage.removeItem(
        "revlyVerificationEmail"
      );

      setSuccess(
        "Email verified successfully! 💗"
      );

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    try {
      setResending(true);

      await resendVerificationEmail(email);

      setOtp("");

      setSuccess(
        "A new verification code has been sent! 💗"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">

        <div className="verify-email-icon">
          <Mail size={30} />
        </div>

        <h1>Verify Your Email 💗</h1>

        <p className="verify-email-description">
          We've sent a 6-digit verification code to
        </p>

        <strong className="verify-email-address">
          {email}
        </strong>

        {error && (
          <p className="verify-email-error">
            {error}
          </p>
        )}

        {success && (
          <p className="verify-email-success">
            {success}
          </p>
        )}

        <form
          className="verify-email-form"
          onSubmit={handleVerify}
        >
          <label htmlFor="verification-code">
            Verification Code
          </label>

          <input
            id="verification-code"
            className="verify-email-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
          />

          <button
            type="submit"
            className="verify-email-submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          className="verify-email-resend"
          onClick={handleResend}
          disabled={resending}
        >
          {resending
            ? "Sending..."
            : "Resend verification code"}
        </button>

        <div className="verify-email-register">
          Wrong email?

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
          >
            Register again
          </button>
        </div>
      </div>
    </div>
  );
}