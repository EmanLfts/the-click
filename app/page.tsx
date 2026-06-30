"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#060606", color: "#f5ebd7", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: 24 }}>

        <section style={{
          border: "1px solid #3d2b1d",
          borderRadius: 24,
          padding: 24,
          background: "linear-gradient(135deg, #121111 0%, #23150e 100%)"
        }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "#c8a462", marginBottom: 10 }}>
            The Click
          </p>

          <h1 style={{ margin: "0 0 8px", fontSize: "2rem" }}>
            "connect, create, click.".
          </h1>

          <p style={{ margin: 0, color: "#d7cbb0", lineHeight: 1.6 }}>
            A modernized reunion for The Slap energy: bold statuses, vivid moods, communities, and the feeling of a campus bulletin board packed with personality.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link
              href="/signup"
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "none",
                background: "#f0c36c",
                color: "#111",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Join The Click
            </Link>

            <Link
              href="/login"
              style={{
                padding: "12px 16px",
                borderRadius: 999,
                border: "1px solid #f0c36c",
                color: "#f0c36c",
                textDecoration: "none",
                fontWeight: 700
              }}
            >
              Log in
            </Link>
          </div>
        </section>

        <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>

          <div style={{ border: "1px solid #3d2b1d", borderRadius: 20, padding: 18, background: "#121110" }}>
            <strong style={{ color: "#f5ebd7" }}>Riley</strong>
            <p style={{ color: "#d7cbb0" }}>“Weekend jam sesh 🎧”</p>
          </div>

          <div style={{ border: "1px solid #3d2b1d", borderRadius: 20, padding: 18, background: "#121110" }}>
            <strong style={{ color: "#f5ebd7" }}>Katie</strong>
            <p style={{ color: "#d7cbb0" }}>“Feeling artsy today 🎨”</p>
          </div>

          <div style={{ border: "1px solid #3d2b1d", borderRadius: 20, padding: 18, background: "#121110" }}>
            <strong style={{ color: "#f5ebd7" }}>Andre</strong>
            <p style={{ color: "#d7cbb0" }}>“Game night incoming 👾”</p>
          </div>

        </section>

        <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[
            ["Status of the Week", "A spotlight card for the post that has the most attitude."],
            ["Creative fonts", "Choose style, size, and tone for every status update."],
            ["Private circles", "Join private groups on invitation or temporary codes."]
          ].map(([title, text]) => (
            <div key={title} style={{ border: "1px solid #3d2b1d", borderRadius: 20, padding: 18, background: "#121110" }}>
              <h2 style={{ margin: "0 0 8px", color: "#f5ebd7" }}>{title}</h2>
              <p style={{ margin: 0, color: "#d7cbb0", lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}