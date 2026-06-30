"use client";

import { useEffect, useMemo, useState } from "react";
import { getCommunities, getPosts, getUserProfile, savePost } from "@/lib/social-store";
import { supabase } from "@/lib/supabase";

type FeedPost = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
};

type CommunityOption = {
  id: string;
  name: string;
  description: string;
  private: boolean;
  inviteCode?: string;
};

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
  const [visibility, setVisibility] = useState<"public" | "community">("public");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [communityOptions, setCommunityOptions] = useState<CommunityOption[]>([]);
  const [userName, setUserName] = useState("Someone");

  useEffect(() => {
    void loadPosts();
    setCommunityOptions(getCommunities().map((community) => ({ ...community })));

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const profile = getUserProfile(user.id);
        setUserName(profile?.name || user.user_metadata?.full_name || user.email || "Someone");
      }
    });
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });

    if (error) {
      console.log("LOAD ERROR:", error);
      return;
    }

    setPosts((data as FeedPost[]) || []);
  };

  const formattedPosts = useMemo(() => {
    return posts.map((post) => {
      const body = post.content || "";
      const lines = body.split("\n");
      const authorLine = lines[0] || "";
      const author = authorLine.startsWith("Author:") ? authorLine.replace("Author:", "").trim() : "Anonymous user";
      const contentBody = lines.slice(1).join("\n").trim();
      return { ...post, author, contentBody };
    });
  }, [posts]);

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
        visibility === "community" && selectedCommunityId ? `Community: ${selectedCommunityId}` : null,
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
    setInviteCode("");
    void loadPosts();
  };

  return (
    <main style={{ minHeight: "100vh", background: "#060606", color: "#f5ebd7", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: 24 }}>
        <section style={{ border: "1px solid #3d2b1d", borderRadius: 24, padding: 24, background: "linear-gradient(135deg, #121111 0%, #23150e 100%)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.3em", color: "#c8a462", marginBottom: 10 }}>The Click</p>
          <h1 style={{ margin: "0 0 8px", fontSize: "2rem" }}>Status of the Week</h1>
          <p style={{ margin: 0, color: "#d7cbb0", lineHeight: 1.6 }}>Post publicly, post in communities, choose a mood, style your text, and make the feed feel like your own bulletin board.</p>
        </section>

        <section style={{ border: "1px solid #3d2b1d", borderRadius: 24, padding: 20, background: "#121110" }}>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Create a status</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <textarea
              placeholder="What are you up to?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <input placeholder="Mood label" value={moodLabel} onChange={(e) => setMoodLabel(e.target.value)} style={inputStyle} />
              <input placeholder="Emoji or picture" value={moodEmoji} onChange={(e) => setMoodEmoji(e.target.value)} style={inputStyle} />
              <input placeholder="Picture URL (optional)" value={moodPicture} onChange={(e) => setMoodPicture(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={inputStyle}>
                <option value="Georgia">Georgia</option>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
              </select>
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={inputStyle}>
                <option value="14px">14px</option>
                <option value="18px">18px</option>
                <option value="22px">22px</option>
                <option value="28px">28px</option>
              </select>
              <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} style={inputStyle}>
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <input placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} style={inputStyle} />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "community")} style={inputStyle}>
                <option value="public">Post publicly</option>
                <option value="community">Post to a community</option>
              </select>

              {visibility === "community" ? (
                <select value={selectedCommunityId} onChange={(e) => setSelectedCommunityId(e.target.value)} style={inputStyle}>
                  <option value="">Choose a community</option>
                  {communityOptions.map((community) => (
                    <option value={community.id} key={community.id}>{community.name}</option>
                  ))}
                </select>
              ) : null}
            </div>

            <input placeholder="Private community invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} style={inputStyle} />

            <button onClick={createPost} style={{ padding: "12px 16px", borderRadius: 999, border: "none", background: "#f0c36c", color: "#111", cursor: "pointer", fontWeight: 700 }}>
              Post status
            </button>
          </div>
        </section>

        <section style={{ display: "grid", gap: 16 }}>
          {formattedPosts.map((post) => (
            <article key={post.id} style={{ border: "1px solid #3d2b1d", borderRadius: 20, padding: 18, background: "#121110" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <strong>{post.author}</strong>
                <span style={{ color: "#bba37d", fontSize: 12 }}>{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <span style={{ padding: "6px 10px", borderRadius: 999, background: "#221b16", color: "#f5d9a4" }}>{post.contentBody}</span>
                <span style={{ padding: "6px 10px", borderRadius: 999, background: "#221b16", color: "#f5d9a4" }}>{post.content}</span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <p style={{ margin: 0, fontFamily: fontFamily, fontSize: fontSize, fontStyle }}>{post.contentBody}</p>
                {post.content.includes("Mood:") ? <p style={{ margin: 0, color: "#f0c36c" }}>{post.content.split("Mood:")[1]?.split("\n")[0]}</p> : null}
                {post.content.includes("Link:") ? <a href={post.content.split("Link:")[1]?.split("\n")[0]} target="_blank" rel="noreferrer" style={{ color: "#8ec5ff" }}>{post.content.split("Link:")[1]?.split("\n")[0]}</a> : null}
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
  borderRadius: 10,
  border: "1px solid #3d2b1d",
  background: "#1b1918",
  color: "#f7ebd6",
};