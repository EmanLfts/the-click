"use client";

import { useEffect, useMemo, useState } from "react";
import { getCommunities, getUserProfile, savePost } from "@/lib/social-store";
import { supabase } from "@/lib/supabase";

type FeedPost = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
};

const tabs = ["Following", "Discover", "Communities"] as const;
type TabKey = (typeof tabs)[number];

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [content, setContent] = useState("");
  const [moodLabel, setMoodLabel] = useState("Chillin");
  const [moodEmoji, setMoodEmoji] = useState("😎");
  const [moodPicture, setMoodPicture] = useState("");
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontSize, setFontSize] = useState("18px");
  const [fontStyle, setFontStyle] = useState("normal");
  const [link, setLink] = useState("");
  const [visibility, setVisibility] = useState<"public" | "community">(
    "public",
  );
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const communityOptions = useMemo(
    () => getCommunities().map((community) => ({ ...community })),
    [],
  );
  const [userName, setUserName] = useState("Someone");
  const [activeTab, setActiveTab] = useState<TabKey>("Following");

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("LOAD ERROR:", error);
      return;
    }

    setPosts((data as FeedPost[]) || []);
  };

  useEffect(() => {
    void supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.log("LOAD ERROR:", error);
          return;
        }
        setPosts((data as FeedPost[]) || []);
      });

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const profile = getUserProfile(user.id);
        setUserName(
          profile?.name ||
            user.user_metadata?.full_name ||
            user.email ||
            "Someone",
        );
      }
    });
  }, []);

  const formattedPosts = useMemo(() => {
    return posts.map((post) => {
      const body = post.content || "";
      const lines = body.split("\n");
      const authorLine = lines[0] || "";
      const author = authorLine.startsWith("Author:")
        ? authorLine.replace("Author:", "").trim()
        : "Anonymous user";
      const contentBody = lines.slice(1).join("\n").trim();
      return { ...post, author, contentBody };
    });
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (activeTab === "Discover") {
      return formattedPosts.filter((post) => post.content.includes("Mood:"));
    }

    if (activeTab === "Communities") {
      return formattedPosts.slice(0, 4);
    }

    return formattedPosts.slice(0, 5);
  }, [activeTab, formattedPosts]);

  const createPost = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      alert("Not logged in");
      return;
    }

    if (!content.trim()) {
      alert("Write a status first.");
      return;
    }

    const payload = {
      content: [
        `Author: ${userName}`,
        content.trim(),
        `Mood: ${moodLabel} ${moodEmoji}`,
        `Style: ${fontFamily};${fontSize};${fontStyle}`,
        link ? `Link: ${link}` : null,
        moodPicture ? `Picture: ${moodPicture}` : null,
        visibility === "community" && selectedCommunityId
          ? `Community: ${selectedCommunityId}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
      user_id: user.id,
    };

    const { error } = await supabase.from("posts").insert(payload);

    if (error) {
      alert(error.message);
      return;
    }

    savePost({
      id: `${Date.now()}`,
      userId: user.id,
      authorName: userName,
      content: payload.content,
      moodLabel,
      moodEmoji,
      moodPicture: moodPicture || undefined,
      fontFamily,
      fontSize,
      fontStyle,
      link: link || undefined,
      createdAt: new Date().toISOString(),
      visibility,
      communityId: visibility === "community" ? selectedCommunityId : undefined,
    });

    setContent("");
    setMoodLabel("Chillin");
    setMoodEmoji("😎");
    setMoodPicture("");
    setFontFamily("Georgia");
    setFontSize("18px");
    setLink("");
    setVisibility("public");
    setSelectedCommunityId("");
    void loadPosts();
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
        style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24 }}
      >
        <section className="section-panel" style={{ borderRadius: 18, padding: 20 }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--slap-purple)",
              marginBottom: 8,
            }}
          >
            The Click
          </p>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.6rem" }}>
            Status of the Week
          </h1>
          <p style={{ margin: 0, color: "var(--muted-ink)", lineHeight: 1.5 }}>
            A focused mix of public posts, community updates, and mood-first
            status drops.
          </p>
        </section>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab ? "slap-button" : "slap-button secondary"
              }
              style={{ padding: "8px 12px" }}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="sticky-note" style={{ borderRadius: 20, padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12 }}>Create a status</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <textarea
              placeholder="What are you up to?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: 120,
                resize: "vertical",
                background: "var(--panel-bg)",
                color: "var(--ink)",
                border: "1px solid rgba(255, 154, 39, 0.18)",
              }}
            />

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <input
                placeholder="Mood label"
                value={moodLabel}
                onChange={(e) => setMoodLabel(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Emoji or picture"
                value={moodEmoji}
                onChange={(e) => setMoodEmoji(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Picture URL (optional)"
                value={moodPicture}
                onChange={(e) => setMoodPicture(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={inputStyle}
              >
                <option value="Georgia">Georgia</option>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
              </select>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                style={inputStyle}
              >
                <option value="14px">14px</option>
                <option value="18px">18px</option>
                <option value="22px">22px</option>
                <option value="28px">28px</option>
              </select>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                style={inputStyle}
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <input
              placeholder="Link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{
                ...inputStyle,
                background: "var(--card-bg)",
                color: "var(--ink)",
              }}
            />

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "public" | "community")
                }
                style={inputStyle}
              >
                <option value="public">Post publicly</option>
                <option value="community">Post to a community</option>
              </select>

              {visibility === "community" ? (
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Choose a community</option>
                  {communityOptions.map((community) => (
                    <option value={community.id} key={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <button
              className="slap-button"
              onClick={createPost}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
              }}
            >
              Post status
            </button>
          </div>
        </section>

        <div className="slap-divider" />

        <section style={{ display: "grid", gap: 16 }}>
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="feature-panel"
              style={{ borderRadius: 12, padding: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <strong>{post.author}</strong>
                <span style={{ color: "var(--muted-ink)", fontSize: 12 }}>
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    fontStyle,
                    color: "var(--ink)",
                  }}
                >
                  {post.contentBody}
                </p>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {post.content.includes("Mood:") ? (
                  <p style={{ margin: 0, color: "var(--accent-red)" }}>
                    {post.content.split("Mood:")[1]?.split("\n")[0]}
                  </p>
                ) : null}
                {post.content.includes("Link:") ? (
                  <a
                    href={post.content.split("Link:")[1]?.split("\n")[0]}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--slap-purple)" }}
                  >
                    {post.content.split("Link:")[1]?.split("\n")[0]}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255, 154, 39, 0.18)",
  background: "var(--card-bg)",
  color: "var(--ink)",
};
