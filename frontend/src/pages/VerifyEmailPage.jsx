import React, { useEffect, useRef ,useState } from "react";
import { Mail } from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/VerifyEmailPage.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    user,
    verifyEmail,
    resendVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [hasToken, setHasToken] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
  if (hasToken) return;

  if (user) {
    navigate("/");
  }
}, [hasToken, user, navigate]);

  useEffect(() => {
    const token = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    /*

      User clicked the verification link
      inside the email.
    */
    if (token && emailFromUrl) {
      if (verificationStarted.current) return;

     verificationStarted.current = true;

      const decodedEmail =
        decodeURIComponent(emailFromUrl);

      setEmail(decodedEmail);
      setHasToken(true);
      setLoading(true);

      const verify = async () => {
        try {
          setError("");
          setSuccess("");

          await verifyEmail(
            decodedEmail,
            token
          );

          localStorage.removeItem(
            "revlyVerificationEmail"
          );

          setSuccess(
            "Email verified successfully! Welcome to Revly 💗"
          );

          setTimeout(() => {
            navigate("/");
          }, 1200);
        } catch (err) {
          setError(
            err.message ||
              "Verification failed. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

      verify();

      return;
    }

    /*

      User has just registered,
      There is no token yet because the
      token only arrives when they click
      the email verification link.
    */
    const savedEmail = localStorage.getItem(
      "revlyVerificationEmail"
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [searchParams, verifyEmail, navigate]);

  const handleResend = async () => {
    if (!email) return;

    setError("");
    setSuccess("");

    try {
      setResending(true);

      await resendVerificationEmail(email);

      setSuccess(
        "A new verification link has been sent to your email! 💗"
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  /*
    No token = waiting for the user to
    click the link in their email.
  */
  if (!hasToken) {
    return (
      <div className="verify-email-page">
        <div className="verify-email-card">

          <div className="verify-email-icon">
            <Mail size={30} />
          </div>

          <h1>Check Your Email 💗</h1>

          <p className="verify-email-description">
            We've sent a verification link to
          </p>

          {email && (
            <strong className="verify-email-address">
              {email}
            </strong>
          )}

          <p className="verify-email-description">
            Please open your email and click
            <strong> "Verify My Email"</strong> to
            activate your Revly account.
          </p>

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

          <button
            type="button"
            className="verify-email-resend"
            onClick={handleResend}
            disabled={resending || !email}
          >
            {resending
              ? "Sending..."
              : "Resend verification link"}
          </button>

          <div className="verify-email-register">
            Didn't receive the email?

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
            >
              Resend
            </button>
          </div>

          <div className="verify-email-register">
            Wrong email?

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(
                  "revlyVerificationEmail"
                );

                navigate("/register");
              }}
            >
              Register again
            </button>
          </div>

        </div>
      </div>
    );
  }

  /*
    Token exists = user clicked the email
    verification link.
  */
  return (
    <div className="verify-email-page">
      <div className="verify-email-card">

        <div className="verify-email-icon">
          <Mail size={30} />
        </div>

        <h1>Verify Your Email 💗</h1>

        {loading && (
          <>
            <p className="verify-email-description">
              Verifying your email address...
            </p>

            <p className="verify-email-success">
              Please wait 💗
            </p>
          </>
        )}

        {!loading && success && (
          <>
            <p className="verify-email-description">
              Your email address has been verified
              successfully.
            </p>

            {email && (
              <strong className="verify-email-address">
                {email}
              </strong>
            )}

            <p className="verify-email-success">
              {success}
            </p>
          </>
        )}

        {!loading && error && (
          <>
            <p className="verify-email-description">
              We couldn't verify your email address.
            </p>

            {email && (
              <strong className="verify-email-address">
                {email}
              </strong>
            )}

            <p className="verify-email-error">
              {error}
            </p>

            <button
              type="button"
              className="verify-email-resend"
              onClick={handleResend}
              disabled={resending}
            >
              {resending
                ? "Sending..."
                : "Send verification link again"}
            </button>
          </>
        )}

        <div className="verify-email-register">
          Wrong email?

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "revlyVerificationEmail"
              );

              navigate("/register");
            }}
          >
            Register again
          </button>
        </div>

      </div>
    </div>
  );
}