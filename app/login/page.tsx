"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push("/feed");
    } else {
      alert(error.message);
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        placeholder="Email or Phone"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLogin}>Login</button>
    </main>
  );
}