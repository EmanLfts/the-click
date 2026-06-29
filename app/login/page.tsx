"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (!error) {
      router.push("/feed");
    } else {
      alert(error.message);
    }
  };

  return (
    <main style={pageStyle}>
      <div className="polaroid" style={cardStyle}>
        <div style={{ marginBottom: 24 }}>
          <p style={eyebrowStyle}>The Click</p>
          <h1 style={titleStyle}>Welcome back</h1>
          <p style={subtitleStyle}>
            Jump back into your communities, moods, and the latest updates.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={labelStyle}>Email</label>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Password</label>
          <input
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={handleLogin}
            className="slap-button"
            style={buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log in"}
          </button>

          <p style={helperStyle}>
            New here?{" "}
            <Link
              href="/signup"
              style={{ color: "var(--sticky-yellow)", fontWeight: 700 }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "var(--paper-bg)",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 460,
  border: "1px solid rgba(255, 154, 39, 0.2)",
  borderRadius: 28,
  padding: "32px",
  background: "var(--card-bg)",
  boxShadow: "0 24px 60px var(--shadow)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.28em",
  color: "var(--sticky-yellow)",
  fontSize: "0.8rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: "8px 0 8px",
  color: "var(--ink)",
  fontSize: "2rem",
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-ink)",
  lineHeight: 1.6,
};

const labelStyle: React.CSSProperties = {
  color: "var(--muted-ink)",
  fontSize: "0.95rem",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255, 154, 39, 0.18)",
  background: "var(--panel-bg)",
  color: "var(--ink)",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  background: "var(--slap-purple)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const helperStyle: React.CSSProperties = {
  margin: 0,
  textAlign: "center",
  color: "var(--muted-ink)",
};
