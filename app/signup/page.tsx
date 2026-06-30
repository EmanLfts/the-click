"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRecommendedCommunities, saveUserProfile } from "@/lib/social-store";

const hobbies = ["Music", "Gaming", "Film", "Art", "Sports", "Reading", "Photography", "Coding"];

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const recommendedCommunities = useMemo(() => getRecommendedCommunities(selectedInterests), [selectedInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  };

  async function handleSignup() {
    if (!email || !password || !name) {
      setMessage("Please add your name, email, and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      saveUserProfile({
        userId,
        name,
        interests: selectedInterests,
        joinedCommunityIds: [],
      });
    }

    setLoading(false);
    router.push("/feed");
  }

  return (
    <main className="page-shell">
      <div className="section-panel" style={{ display: "grid", gap: 24 }}>
        <div>
          <p className="eyebrow">The Click</p>
          <h1 className="title">Create your account</h1>
          <p className="subtitle">Sign up with an email, pick the things you love, and land in the perfect communities.</p>
        </div>

        <div className="section-panel" style={{ padding: 24, gap: 20 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
          </div>

          <div>
            <h2>Pick your interests</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {hobbies.map((hobby) => {
                const active = selectedInterests.includes(hobby);
                return (
                  <button key={hobby} type="button" onClick={() => toggleInterest(hobby)} className={active ? "slap-button" : "slap-button secondary"} style={{ padding: "8px 14px", borderRadius: 999, background: active ? "#ffcc5c" : "rgba(255,255,255,0.06)", color: active ? "#111" : "var(--foreground)" }}>
                    {hobby}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2>Recommended communities</h2>
            <div className="feature-grid" style={{ marginTop: 12 }}>
              {recommendedCommunities.map((community) => (
                <div key={community.id} className="feature-panel">
                  <strong>{community.name}</strong>
                  <p>{community.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSignup} disabled={loading} className="slap-button" style={{ width: "fit-content" }}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          {message ? <p style={{ color: "#ffbd6c" }}>{message}</p> : null}
        </div>
      </div>
    </main>
  );
}

const pillStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #5b4027",
  cursor: "pointer",
};