"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  defaultAvatarStyle,
  defaultProfileTheme,
  getRecommendedCommunities,
  saveUserProfile,
  type AvatarStyle,
} from "@/lib/social-store";

const hobbies = [
  "Music",
  "Gaming",
  "Film",
  "Art",
  "Sports",
  "Reading",
  "Photography",
  "Coding",
];
const steps = ["Account", "Interests", "Communities", "Avatar"];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarStyle, setAvatarStyle] =
    useState<AvatarStyle>(defaultAvatarStyle);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const recommendedCommunities = useMemo(
    () => getRecommendedCommunities(selectedInterests),
    [selectedInterests],
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const goNext = () => {
    if (step === 0 && (!name || !contact || !password)) {
      setMessage("Please fill in your name, contact, and password.");
      return;
    }

    if (step === 1 && selectedInterests.length === 0) {
      setMessage("Pick at least one interest to discover communities.");
      return;
    }

    setMessage("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  type SignupPayload = {
    email?: string;
    phone?: string;
    password: string;
    options: { data: { full_name: string } };
  };

  async function handleSignup() {
    if (!name || !contact || !password || !username) {
      setMessage(
        "Please complete the first step before creating your account.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const isEmail = contact.includes("@") || contact.includes(".");
    const signupPayload: SignupPayload = isEmail
      ? { email: contact, password, options: { data: { full_name: name } } }
      : { phone: contact, password, options: { data: { full_name: name } } };

    const { data, error } = await supabase.auth.signUp(signupPayload);

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
        username,
        contact,
        birthdate,
        interests: selectedInterests,
        joinedCommunityIds: [],
        avatarStyle,
        bio: "Fresh face on The Click.",
        mood: "Chillin",
        bannerColor: defaultProfileTheme.bannerColor,
      });
    }

    setLoading(false);
    router.push("/feed");
  }

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
        className="section-panel"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 28,
          padding: 28,
          background: "var(--card-bg)",
          boxShadow: "0 24px 60px var(--shadow)",
        }}
      >
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "var(--slap-purple)",
            marginBottom: 8,
          }}
        >
          The Click
        </p>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: "2rem" }}>
          Create your account
        </h1>
        <p style={{ color: "var(--muted-ink)", lineHeight: 1.6 }}>
          A bright, bold welcome into your own social corner with communities,
          avatars, and personal flair.
        </p>

        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}
        >
          {steps.map((item, index) => (
            <div
              key={item}
              className="slap-chip"
              style={{
                background: index === step ? "var(--slap-purple)" : "var(--accent-soft)",
                color: index === step ? "#fff" : "var(--foreground)",
              }}
            >
              {index + 1}. {item}
            </div>
          ))}
        </div>

        <div className="slap-divider" />

        {step === 0 ? (
          <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <input
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Email or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              style={inputStyle}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Pick your interests</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {hobbies.map((hobby) => {
                const active = selectedInterests.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => toggleInterest(hobby)}
                    style={{
                      ...pillStyle,
                      background: active ? "var(--sticky-yellow)" : "var(--card-bg)",
                      color: active ? "#111" : "var(--foreground)",
                    }}
                  >
                    {hobby}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Recommended communities</h2>
            <div className="section-panel" style={{ padding: 20, borderRadius: 24 }}>
              <div style={{ display: "grid", gap: 10 }}>
                {recommendedCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="feature-panel"
                    style={{
                      borderRadius: 18,
                      padding: 16,
                      background: "var(--card-bg)",
                    }}
                  >
                    <strong>{community.name}</strong>
                    <p style={{ margin: "8px 0 0", color: "var(--muted-ink)" }}>
                      {community.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Create your cartoon avatar</h2>
            <div
              className="section-panel"
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                alignItems: "start",
                padding: 20,
                borderRadius: 24,
              }}
            >
              <div
                className="feature-panel"
                style={{
                  borderRadius: 20,
                  padding: 18,
                  background: "var(--card-bg)",
                }}
              >
                <AvatarPreview avatarStyle={avatarStyle} />
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
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      marginBottom: 6,
                      color: "var(--muted-ink)",
                    }}
                  >
                    Accent
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { label: "Gold", value: "#ffd166" },
                      { label: "Mint", value: "#8ce99a" },
                      { label: "Orange", value: "#ff9f1c" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setAvatarStyle((current) => ({
                            ...current,
                            accent: option.value,
                          }))
                        }
                        style={{
                          ...pillStyle,
                          background:
                            avatarStyle.accent === option.value
                              ? "var(--sticky-yellow)"
                              : "var(--card-bg)",
                          color:
                            avatarStyle.accent === option.value
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
                    Accessory
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { label: "Sparkles", value: "sparkles" },
                      { label: "Glasses", value: "glasses" },
                      { label: "Star", value: "star" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setAvatarStyle((current) => ({
                            ...current,
                            accessory: option.value,
                          }))
                        }
                        style={{
                          ...pillStyle,
                          background:
                            avatarStyle.accessory === option.value
                              ? "var(--sticky-yellow)"
                              : "var(--card-bg)",
                          color:
                            avatarStyle.accessory === option.value
                              ? "#111"
                              : "var(--foreground)",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            className="slap-button secondary"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "var(--accent-soft)",
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              className="slap-button"
              onClick={goNext}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
              }}
            >
              Next
            </button>
          ) : (
            <button
              className="slap-button"
              onClick={handleSignup}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
              }}
            >
              {loading ? "Creating account..." : "Finish setup"}
            </button>
          )}
        </div>

        {message ? (
          <p style={{ marginTop: 12, color: "var(--sticky-yellow)" }}>
            {message}
          </p>
        ) : null}
      </div>
    </main>
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

function AvatarPreview({ avatarStyle }: { avatarStyle: AvatarStyle }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
      }}
    >
      <svg viewBox="0 0 120 120" width="120" height="120">
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
