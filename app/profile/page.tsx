"use client";

import { useEffect, useState } from "react";
import {
  defaultAvatarStyle,
  defaultProfileTheme,
  getUserProfile,
  saveUserProfile,
  type AvatarStyle,
} from "@/lib/social-store";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [name, setName] = useState("Your name");
  const [username, setUsername] = useState("coolcat");
  const [bio, setBio] = useState("Fresh face on The Click.");
  const [mood, setMood] = useState("Chillin");
  const [bannerColor, setBannerColor] = useState(
    defaultProfileTheme.bannerColor,
  );
  const [avatarStyle, setAvatarStyle] =
    useState<AvatarStyle>(defaultAvatarStyle);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;

      const profile = getUserProfile(user.id);
      setUserId(user.id);
      setName(
        profile?.name ||
          user.user_metadata?.full_name ||
          user.email ||
          "Your name",
      );
      setUsername(profile?.username || "coolcat");
      setBio(profile?.bio || "Fresh face on The Click.");
      setMood(profile?.mood || "Chillin");
      setBannerColor(profile?.bannerColor || defaultProfileTheme.bannerColor);
      setAvatarStyle(profile?.avatarStyle || defaultAvatarStyle);
    });
  }, []);

  const saveProfile = () => {
    if (!userId) return;

    const currentProfile = getUserProfile(userId);
    saveUserProfile({
      userId,
      name,
      username,
      contact: currentProfile?.contact,
      birthdate: currentProfile?.birthdate,
      interests: currentProfile?.interests || [],
      joinedCommunityIds: currentProfile?.joinedCommunityIds || [],
      avatarStyle,
      bio,
      mood,
      bannerColor,
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper-bg)",
        color: "var(--ink)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 20 }}
      >
        <section className="section-panel" style={{ borderRadius: 24, padding: 24 }}>
          <div
            style={{
              height: 140,
              borderRadius: 20,
              background: bannerColor,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <AvatarPreview avatarStyle={avatarStyle} />
            <div>
              <p
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "var(--slap-purple)",
                  marginBottom: 6,
                }}
              >
                Profile
              </p>
              <h1 style={{ margin: "0 0 8px", fontSize: "2rem" }}>{name}</h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--muted-ink)",
                  lineHeight: 1.6,
                }}
              >
                @{username} • {mood}
              </p>
            </div>
          </div>
        </section>

        <div className="slap-divider" />

        <section
          className="section-panel"
          style={{ borderRadius: 24, padding: 20, display: "grid", gap: 16 }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            />
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={inputStyle}
            />
            <input
              value={bannerColor}
              onChange={(e) => setBannerColor(e.target.value)}
              type="color"
              style={{
                width: 60,
                height: 44,
                borderRadius: 8,
                border: "1px solid rgba(255, 154, 39, 0.3)",
                background: "var(--card-bg)",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 13,
                  marginBottom: 6,
                  color: "var(--muted-ink)",
                }}
              >
                Hair
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Dark", value: "#2d1a12" },
                  { label: "Blonde", value: "#d9b45b" },
                  { label: "Pink", value: "#e67ab2" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setAvatarStyle((current) => ({
                        ...current,
                        hair: option.value,
                      }))
                    }
                    style={{
                      ...pillStyle,
                      background:
                        avatarStyle.hair === option.value
                          ? "var(--sticky-yellow)"
                          : "var(--card-bg)",
                      color:
                        avatarStyle.hair === option.value
                          ? "#111"
                          : "var(--foreground)",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  marginBottom: 6,
                  color: "var(--muted-ink)",
                }}
              >
                Shirt
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Coral", value: "#ff6b6b" },
                  { label: "Teal", value: "#4ecdc4" },
                  { label: "Lilac", value: "#9b8cff" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setAvatarStyle((current) => ({
                        ...current,
                        shirt: option.value,
                      }))
                    }
                    style={{
                      ...pillStyle,
                      background:
                        avatarStyle.shirt === option.value
                          ? "var(--sticky-yellow)"
                          : "var(--card-bg)",
                      color:
                        avatarStyle.shirt === option.value
                          ? "#111"
                          : "var(--foreground)",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="slap-button"
              onClick={saveProfile}
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
              }}
            >
              Save profile
            </button>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            ["Posts", "Your latest updates and boldest status drops."],
            ["Photos", "Polaroids, snapshots, and favorite stills."],
            [
              "Communities",
              "The circles you belong to and the ones you build.",
            ],
            ["Favorites", "Videos, games, and posts you keep close."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="feature-panel"
              style={{ borderRadius: 18, padding: 16 }}
            >
              <strong>{title}</strong>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--muted-ink)",
                  lineHeight: 1.6,
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function AvatarPreview({ avatarStyle }: { avatarStyle: AvatarStyle }) {
  return (
    <div
      style={{
        width: 112,
        height: 112,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        background: "var(--card-bg)",
        border: "3px solid var(--sticky-yellow)",
      }}
    >
      <svg viewBox="0 0 120 120" width="96" height="96">
        <circle cx="60" cy="44" r="24" fill={avatarStyle.skin} />
        <rect
          x="34"
          y="26"
          width="20"
          height="23"
          rx="8"
          fill={avatarStyle.hair}
        />
        <rect
          x="58"
          y="26"
          width="20"
          height="23"
          rx="8"
          fill={avatarStyle.hair}
        />
        <rect
          x="36"
          y="62"
          width="48"
          height="34"
          rx="16"
          fill={avatarStyle.shirt}
        />
        <rect
          x="44"
          y="72"
          width="32"
          height="10"
          rx="5"
          fill={avatarStyle.accent}
        />
        {avatarStyle.accessory === "glasses" ? (
          <>
            <rect x="40" y="46" width="18" height="10" rx="4" fill="#111" />
            <rect x="62" y="46" width="18" height="10" rx="4" fill="#111" />
            <line
              x1="58"
              y1="51"
              x2="62"
              y2="51"
              stroke="#111"
              strokeWidth="3"
            />
          </>
        ) : null}
        {avatarStyle.accessory === "sparkles" ? (
          <circle cx="84" cy="32" r="4" fill="#fff1a8" />
        ) : null}
        {avatarStyle.accessory === "star" ? (
          <path
            d="M90 24 L93 34 L104 34 L95 41 L99 52 L90 46 L81 52 L85 41 L76 34 L87 34 Z"
            fill="#fff1a8"
          />
        ) : null}
      </svg>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255, 154, 39, 0.18)",
  background: "var(--panel-bg)",
  color: "var(--ink)",
};

const pillStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255, 154, 39, 0.2)",
  background: "var(--panel-bg)",
  color: "var(--foreground)",
  cursor: "pointer",
};
