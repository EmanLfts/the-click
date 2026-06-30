"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    void loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;

    if (!u) return;

    setUser(u);
    setName(u.user_metadata?.full_name || u.email || "User");

    const metaAvatar = u.user_metadata?.avatar_url;
    if (metaAvatar) setAvatarUrl(metaAvatar);
  };

  const updateProfile = async () => {
    if (!user) return;

    await supabase.auth.updateUser({
      data: {
        full_name: name,
        avatar_url: avatarUrl
      }
    });

    alert("Profile updated");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#060606", color: "#f5ebd7", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gap: 24 }}>

        <section style={{
          border: "1px solid #3d2b1d",
          borderRadius: 24,
          padding: 24,
          background: "linear-gradient(135deg, #121111 0%, #23150e 100%)"
        }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Profile</h1>
          <p style={{ margin: "8px 0 0", color: "#d7cbb0" }}>
            User identity and display settings
          </p>
        </section>

        <section style={{
          border: "1px solid #3d2b1d",
          borderRadius: 24,
          padding: 24,
          background: "#121110",
          display: "grid",
          gap: 16
        }}>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#1b1918",
                border: "1px solid #3d2b1d",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d7cbb0"
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "No Image"
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #3d2b1d",
                  background: "#1b1918",
                  color: "#f7ebd6"
                }}
              />
            </div>
          </div>

          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Profile picture URL"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #3d2b1d",
              background: "#1b1918",
              color: "#f7ebd6"
            }}
          />

          <button
            onClick={updateProfile}
            style={{
              padding: "12px 16px",
              borderRadius: 999,
              border: "none",
              background: "#f0c36c",
              color: "#111",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            Save Profile
          </button>

          {user && (
            <div style={{ color: "#d7cbb0", fontSize: 14 }}>
              Logged in as: {user.email}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}