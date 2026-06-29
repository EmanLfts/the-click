"use client";

import Link from "next/link";

const featureCards = [
  {
    title: "Create your own vibe",
    text: "Style your posts with bold fonts, moods, and links that look like a scrapbook and a feed at once.",
  },
  {
    title: "Join lively communities",
    text: "From school clubs to music circles to gaming crews, every group has its own personality.",
  },
  {
    title: "Show off your avatar",
    text: "Create a playful 2D character and make it part of your signature profile.",
  },
];

const creators = ["Mina", "Jules", "Ari", "Tori"];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper-bg)",
        color: "var(--ink)",
        padding: "40px 20px 64px",
      }}
    >
      <div
        style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 24 }}
      >
        <section
          className="section-panel"
          style={{ borderRadius: 22, padding: "32px 26px" }}
        >
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--slap-purple)",
              marginBottom: 8,
            }}
          >
            The Click
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              margin: "0 0 10px",
              lineHeight: 1.05,
            }}
          >
            Connect. Create. Click.
          </h1>
          <p
            style={{
              maxWidth: 720,
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--muted-ink)",
              margin: 0,
            }}
          >
            A reimagining of the classic sticky‑note bulletin: build avatars,
            drop bold statuses, and gather your people in focused spaces.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/signup"
              className="slap-button"
              style={{ textDecoration: "none" }}
            >
              Create account
            </Link>
            <Link
              href="/feed"
              className="slap-button secondary"
              style={{ textDecoration: "none" }}
            >
              Open the feed
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="feature-panel"
              style={{ borderRadius: 12, padding: 18 }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  color: "var(--slap-purple)",
                }}
              >
                {card.title}
              </h2>
              <p
                style={{
                  color: "var(--muted-ink)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <div className="feature-panel" style={{ borderRadius: 12, padding: 18 }}>
            <p
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--slap-purple)",
                marginBottom: 8,
              }}
            >
              Featured creators
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {creators.map((creator) => (
                <span
                  key={creator}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "var(--card-bg)",
                    color: "var(--slap-purple)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {creator}
                </span>
              ))}
            </div>
          </div>
          <div className="feature-panel" style={{ borderRadius: 12, padding: 18 }}>
            <p
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--slap-purple)",
                marginBottom: 8,
              }}
            >
              Avatar of the week
            </p>
            <p
              style={{ margin: 0, color: "var(--muted-ink)", lineHeight: 1.6 }}
            >
              Bright, bold, and unapologetically extra — this week’s featured
              look is all about color and confidence.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
