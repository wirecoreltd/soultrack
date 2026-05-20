"use client";

import HeaderPages from "../../components/HeaderPages";
import Footer from "../../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#333699] text-white flex flex-col">
      
      {/* HEADER */}
      <HeaderPages />

      {/* BODY */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 24px",
          fontFamily: "Arial, sans-serif",
          lineHeight: 1.7,
        }}
      >
        <h1 style={{ color: "#60a5fa", marginBottom: 8 }}>
          Privacy Policy
        </h1>

        <p style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 40 }}>
          Last updated: May 2026
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly, including your name, email address, church information, and member data entered into the platform.
        </p>

        <h2>2. How We Use Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Process payments</li>
          <li>Send service-related communications</li>
          <li>Ensure account security</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share data with third-party providers (Paddle, PayPal, Supabase) only to operate the service.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your data against unauthorized access or misuse.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We keep your data as long as your account is active. You may request deletion at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You may access, modify, or delete your data at any time by contacting support@soultrack.app.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We only use essential cookies required for authentication and session management. No tracking cookies are used.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy questions:{" "}
          <a href="mailto:support@soultrack.app" style={{ color: "#60a5fa" }}>
            support@soultrack.app
          </a>
        </p>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
