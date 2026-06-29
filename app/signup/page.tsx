"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for confirmation.");
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Sign Up</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p>{message}</p>
    </main>
  );
}