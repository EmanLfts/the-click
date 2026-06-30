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
    <main className="page-shell">
      <div className="polaroid" style={cardStyle}>
        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow">The Click</p>
          <h1 className="title">Welcome back</h1>
          <p className="subtitle">
            Jump back into your communities, moods, and the latest updates.
          </p>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <label className="field-label">Email</label>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />

          <label className="field-label">Password</label>
          <input
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />

          <button onClick={handleLogin} className="slap-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Log in"}
          </button>

          <p className="helper-copy">
            New here? <Link href="/signup" className="link-inline">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  border: "1px solid rgba(255, 154, 39, 0.22)",
  borderRadius: 26,
  padding: "32px",
  background: "var(--card-bg)",
  boxShadow: "0 28px 70px var(--shadow)",
};
