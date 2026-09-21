import React, { useState } from "react";

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-brand">
          <strong>Revly ♡</strong>
          <p>Real people. Real reviews. Real beautiful you.</p>
        </div>

        <div className="footer-links">
          <button type="button" onClick={() => setActiveModal("about")}>
            About
          </button>

          <button type="button" onClick={() => setActiveModal("privacy")}>
            Privacy
          </button>

          <button type="button" onClick={() => setActiveModal("terms")}>
            Terms
          </button>

          <button type="button" onClick={() => setActiveModal("contact")}>
            Contact
          </button>
        </div>

        <span>© 2026 Revly</span>
      </footer>

      {activeModal && (
        <div
          className="footer-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="footer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="footer-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>

            {activeModal === "about" && (
              <>
                <h2>About Revly</h2>

                <p>
                  Revly is a beauty community where people can discover
                  products, share honest reviews, connect with other beauty
                  lovers, and learn from real experiences.
                </p>

                <p>
                  Instead of relying only on advertisements and marketing,
                  Revly focuses on what real people are saying about the
                  products they use.
                </p>

                <p className="footer-modal-highlight">
                  Real people. Real reviews. Real beautiful you. ♡
                </p>
              </>
            )}

            {activeModal === "privacy" && (
              <>
                <h2>Privacy Policy</h2>

                <p>
                  Revly collects information that is necessary to provide
                  account and community features.
                </p>

                <h3>Information we may collect</h3>

                <ul>
                  <li>Name and username</li>
                  <li>Email address</li>
                  <li>Profile information</li>
                  <li>Beauty preferences such as skin type and concerns</li>
                  <li>Reviews, messages and other content you choose to share</li>
                </ul>

                <h3>How we use your information</h3>

                <p>
                  Your information may be used to provide authentication,
                  personalize the community experience, display your profile,
                  and enable features such as reviews, following and messaging.
                </p>

                <p>
                  Passwords are securely hashed and are not stored as plain
                  text.
                </p>
              </>
            )}

            {activeModal === "terms" && (
              <>
                <h2>Terms of Service</h2>

                <p>
                  By using Revly, you agree to use the platform responsibly
                  and respectfully.
                </p>

                <h3>Community guidelines</h3>

                <ul>
                  <li>Share genuine experiences and opinions.</li>
                  <li>Do not impersonate another person.</li>
                  <li>Do not post abusive, threatening or hateful content.</li>
                  <li>Do not intentionally post misleading information.</li>
                  <li>Respect other members of the Revly community.</li>
                </ul>

                <p>
                  Product reviews represent the opinions and experiences of
                  individual users and should not be treated as professional
                  medical or dermatological advice.
                </p>
              </>
            )}
{activeModal === "contact" && (
  <>
    <h2>Contact Revly</h2>

    <p>
      Have a question, suggestion or feedback? We'd love to hear
      from you. ♡
    </p>

    <div className="contact-box">
      <strong>Support email</strong>

      <p>
        <a
          href="mailto:revly5120@gmail.com"
          className="contact-email"
        >
          siyasingh2917@gmail.com
        </a>
      </p>
    </div>

    <a
      href="mailto:revly5120@gmail.com"
      className="contact-button"
    >
      Email Revly →
    </a>
  </>
)}
           
      
             
          </div>
        </div>
      )}
    </>
  );
}