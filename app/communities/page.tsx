"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCommunities,
  getPosts,
  getUserProfile,
  joinCommunity,
  saveCommunity,
  savePost,
  saveUserProfile,
  type Community,
  type SocialPost,
  type UserProfile,
} from "@/lib/social-store";

const CURRENT_USER_ID = "local-user";
type SectionKey = "create" | "discover" | "your-communities";
type InviteModalState = {
  open: boolean;
  code: string;
  communityName: string;
  expiresAt: string;
} | null;

export default function Communities() {
  const [activeSection, setActiveSection] = useState<SectionKey>("create");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [communities, setCommunities] = useState<Community[]>(() =>
    getCommunities(),
  );
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const existingProfile = getUserProfile(CURRENT_USER_ID);
    if (existingProfile) {
      return existingProfile;
    }

    return saveUserProfile({
      userId: CURRENT_USER_ID,
      name: "You",
      interests: [],
      joinedCommunityIds: [],
    });
  });
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    () => getCommunities()[0]?.id ?? null,
  );
  const [communityPosts, setCommunityPosts] = useState<SocialPost[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [privateCommunity, setPrivateCommunity] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinFeedback, setJoinFeedback] = useState("");
  const [inviteModal, setInviteModal] = useState<InviteModalState>(null);
  const [postContent, setPostContent] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!inviteModal?.open) {
      return;
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [inviteModal?.open]);

  const refreshState = (nextSelectedCommunityId?: string | null) => {
    const nextCommunities = getCommunities();
    setCommunities(nextCommunities);

    const nextProfile = getUserProfile(CURRENT_USER_ID);
    if (nextProfile) {
      setProfile(nextProfile);
    }

    const chosenId = nextSelectedCommunityId ?? selectedCommunityId;
    if (chosenId) {
      setCommunityPosts(
        getPosts().filter((post) => post.communityId === chosenId),
      );
    } else {
      setCommunityPosts([]);
    }
  };

  const joinedCommunities = useMemo(() => {
    return communities.filter((community) =>
      profile?.joinedCommunityIds.includes(community.id),
    );
  }, [communities, profile]);

  const discoverCommunities = useMemo(() => {
    return communities.filter(
      (community) => !profile?.joinedCommunityIds.includes(community.id),
    );
  }, [communities, profile]);

  const activeCommunity = useMemo(() => {
    return (
      communities.find((community) => community.id === selectedCommunityId) ??
      null
    );
  }, [communities, selectedCommunityId]);

  const canViewActiveCommunityFeed = Boolean(
    activeCommunity && profile?.joinedCommunityIds.includes(activeCommunity.id),
  );

  const timeLeftLabel = useMemo(() => {
    if (!inviteModal?.expiresAt) {
      return "";
    }

    const diff = new Date(inviteModal.expiresAt).getTime() - now;
    if (diff <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s left`;
  }, [inviteModal, now]);

  const createCommunity = () => {
    if (!name.trim()) {
      return;
    }

    const createdCommunity: Community = {
      id: `${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "A bright new corner of The Click.",
      category: category.trim() || "General",
      private: privateCommunity,
      ownerId: CURRENT_USER_ID,
      bannerImage: bannerImage || bannerUrl || undefined,
    };

    saveCommunity(createdCommunity);

    const nextProfile = profile
      ? {
          ...profile,
          joinedCommunityIds: profile.joinedCommunityIds.includes(
            createdCommunity.id,
          )
            ? profile.joinedCommunityIds
            : [...profile.joinedCommunityIds, createdCommunity.id],
        }
      : {
          userId: CURRENT_USER_ID,
          name: "You",
          interests: [],
          joinedCommunityIds: [createdCommunity.id],
        };

    saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setName("");
    setDescription("");
    setCategory("General");
    setPrivateCommunity(false);
    setBannerUrl("");
    setBannerImage("");
    setActiveSection("your-communities");
    setSelectedCommunityId(createdCommunity.id);
    refreshState(createdCommunity.id);
  };

  const handleBannerFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBannerImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleJoinCommunity = (communityId: string) => {
    if (!profile) {
      return;
    }

    const existingIds = profile.joinedCommunityIds;
    if (existingIds.includes(communityId)) {
      setSelectedCommunityId(communityId);
      setActiveSection("your-communities");
      return;
    }

    const nextProfile = {
      ...profile,
      joinedCommunityIds: [...existingIds, communityId],
    };

    saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setSelectedCommunityId(communityId);
    setActiveSection("your-communities");
    refreshState(communityId);
  };

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      setJoinFeedback("Enter a community code to continue.");
      return;
    }

    const joinedCommunity = joinCommunity(CURRENT_USER_ID, joinCode.trim());
    if (!joinedCommunity) {
      setJoinFeedback("That code is invalid or has already expired.");
      return;
    }

    setJoinFeedback(`You joined ${joinedCommunity.name}.`);
    setJoinCode("");
    setSelectedCommunityId(joinedCommunity.id);
    setActiveSection("your-communities");
    refreshState(joinedCommunity.id);
  };

  const handleGenerateInviteCode = (communityId: string) => {
    const community = communities.find((item) => item.id === communityId);
    if (!community) {
      return;
    }

    const code = `CL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const updatedCommunity: Community = {
      ...community,
      inviteCode: code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    };

    saveCommunity(updatedCommunity);
    setInviteModal({
      open: true,
      code,
      communityName: community.name,
      expiresAt: updatedCommunity.expiresAt,
    });
    setNow(Date.now());
    refreshState(communityId);
  };

  const handleCreateCommunityPost = () => {
    if (!activeCommunity || !postContent.trim()) {
      return;
    }

    savePost({
      id: `${Date.now()}`,
      userId: CURRENT_USER_ID,
      authorName: profile?.name || "You",
      content: postContent.trim(),
      moodLabel: "In the room",
      moodEmoji: "✨",
      fontFamily: "Georgia",
      fontSize: "16px",
      fontStyle: "normal",
      createdAt: new Date().toISOString(),
      visibility: "community",
      communityId: activeCommunity.id,
    });

    setPostContent("");
    refreshState(activeCommunity.id);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper-bg)",
        color: "var(--ink)",
        padding: "24px 20px 48px",
      }}
    >
      <div
        style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 22 }}
      >
        <section className="section-panel" style={{ borderRadius: 24, padding: 24 }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "var(--slap-purple)",
              marginBottom: 8,
            }}
          >
            Communities
          </p>
          <h1 style={{ margin: "0 0 8px", fontSize: "2rem" }}>
            A home for your circles
          </h1>
          <p style={{ margin: 0, color: "var(--muted-ink)", lineHeight: 1.6 }}>
            Create new spaces, discover what people are building, and keep your
            private communities locked behind one-time invite codes.
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: sidebarCollapsed
              ? "72px 1fr"
              : "minmax(240px, 28%) 1fr",
            alignItems: "start",
          }}
        >
          <aside
            className="polaroid"
            style={{
              borderRadius: 28,
              padding: 18,
              background: "var(--card-bg)",
              position: "sticky",
              top: 20,
            }}
          >
            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              style={{ ...iconButtonStyle, marginBottom: 12 }}
            >
              {sidebarCollapsed ? "☰" : "✕"}
            </button>

            <div style={{ display: "grid", gap: 10 }}>
              {[
                { key: "create", label: "Create new community" },
                { key: "discover", label: "Discover communities" },
                { key: "your-communities", label: "Your communities" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as SectionKey)}
                  className={
                    activeSection === item.key
                      ? "slap-button"
                      : "slap-button secondary"
                  }
                  style={{
                    ...menuButtonStyle,
                    padding: "10px 14px",
                    background:
                      activeSection === item.key
                        ? "var(--slap-purple)"
                        : "var(--accent-soft)",
                    color:
                      activeSection === item.key ? "#fff" : "var(--ink)",
                  }}
                >
                  {sidebarCollapsed ? item.label.split(" ")[0][0] : item.label}
                </button>
              ))}
            </div>
          </aside>

          <section
            className="section-panel"
            style={{ borderRadius: 24, padding: 20 }}
          >
            {activeSection === "create" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <h2 style={{ margin: 0 }}>Create a new community</h2>
                <p style={{ margin: 0, color: "var(--muted-ink)" }}>
                  Build a place for your crew and choose whether it stays open
                  or private.
                </p>

                <input
                  value={name}
                  placeholder="Community name"
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
                <textarea
                  value={description}
                  placeholder="What is this community about?"
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
                />
                <input
                  value={category}
                  placeholder="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--muted-ink)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={privateCommunity}
                    onChange={(e) => setPrivateCommunity(e.target.checked)}
                  />
                  Make it private
                </label>

                <div
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    handleBannerFile(event.dataTransfer.files?.[0] ?? null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  style={{
                    ...inputStyle,
                    minHeight: 96,
                    display: "grid",
                    gap: 8,
                    border: dragActive
                      ? "1px dashed var(--sticky-yellow)"
                      : "1px solid var(--muted-ink)",
                  }}
                >
                  <strong>Community banner</strong>
                  <span style={{ color: "var(--muted-ink)" }}>
                    Drop an image here or use a file picker below.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleBannerFile(event.target.files?.[0] ?? null)
                    }
                  />
                  <input
                    value={bannerUrl}
                    placeholder="Or paste an image URL"
                    onChange={(e) => setBannerUrl(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {bannerImage || bannerUrl ? (
                  <img
                    src={bannerImage || bannerUrl}
                    alt="Community banner preview"
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 16,
                      boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
                    }}
                  />
                ) : null}

                <button
                  onClick={createCommunity}
                  className="slap-button"
                  style={{ padding: "12px 16px" }}
                >
                  Create community
                </button>
              </div>
            ) : null}

            {activeSection === "discover" ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div className="polaroid" style={{ padding: 18 }}>
                  <h3 style={{ marginTop: 0 }}>Join with a code</h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Enter invite code"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={handleJoinWithCode}
                      className="slap-button"
                      style={{ padding: "10px 14px" }}
                    >
                      Join community
                    </button>
                  </div>
                  {joinFeedback ? (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "var(--sticky-yellow)",
                      }}
                    >
                      {joinFeedback}
                    </p>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {discoverCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="polaroid"
                      style={{ padding: 16 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <strong>{community.name}</strong>
                        <span
                          style={{ color: "var(--slap-purple)", fontSize: 12 }}
                        >
                          {community.private ? "Private" : "Public"}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "8px 0",
                          color: "var(--muted-ink)",
                          lineHeight: 1.5,
                        }}
                      >
                        {community.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{ color: "var(--muted-ink)", fontSize: 12 }}
                        >
                          {community.category}
                        </span>
                        {community.private ? (
                          <span
                            style={{
                              color: "var(--slap-purple)",
                              fontSize: 12,
                            }}
                          >
                            Invite required
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinCommunity(community.id)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 999,
                              border: "none",
                              background: "var(--sticky-yellow)",
                              color: "#111",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "your-communities" ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 12 }}>
                  {joinedCommunities.length ? (
                    joinedCommunities.map((community) => (
                      <button
                        key={community.id}
                        onClick={() => setSelectedCommunityId(community.id)}
                        className="polaroid"
                        style={{
                          textAlign: "left",
                          border: "none",
                          padding: 16,
                          background:
                            selectedCommunityId === community.id
                              ? "rgba(255, 213, 74, 0.14)"
                              : "var(--card-bg)",
                          color: "var(--ink)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <strong>{community.name}</strong>
                          <span
                            style={{
                              color: "var(--slap-purple)",
                              fontSize: 12,
                            }}
                          >
                            {community.private ? "Private" : "Public"}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "8px 0 0",
                            color: "var(--muted-ink)",
                            lineHeight: 1.5,
                          }}
                        >
                          {community.description}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: "var(--muted-ink)" }}>
                      Join a community to start seeing its feed here.
                    </p>
                  )}
                </div>

                {activeCommunity ? (
                  <div
                    className="polaroid"
                    style={{ padding: 20, display: "grid", gap: 14 }}
                  >
                    {activeCommunity.bannerImage ? (
                      <img
                        src={activeCommunity.bannerImage}
                        alt={`${activeCommunity.name} banner`}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 16,
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0 }}>{activeCommunity.name}</h3>
                        <p
                          style={{
                            margin: "6px 0 0",
                            color: "var(--muted-ink)",
                          }}
                        >
                          {activeCommunity.description}
                        </p>
                      </div>
                      {activeCommunity.private &&
                      activeCommunity.ownerId === CURRENT_USER_ID ? (
                        <button
                          onClick={() =>
                            handleGenerateInviteCode(activeCommunity.id)
                          }
                          className="slap-button secondary"
                          style={{ padding: "8px 12px" }}
                        >
                          Generate code
                        </button>
                      ) : null}
                    </div>

                    {canViewActiveCommunityFeed ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder={`Drop a note for ${activeCommunity.name}`}
                          style={{
                            ...inputStyle,
                            minHeight: 90,
                            resize: "vertical",
                          }}
                        />
                        <button
                          onClick={handleCreateCommunityPost}
                          className="slap-button secondary"
                          style={{ padding: "8px 12px" }}
                        >
                          Post to community
                        </button>

                        <div style={{ display: "grid", gap: 10 }}>
                          {communityPosts.length ? (
                            communityPosts.map((post) => (
                              <div
                                key={post.id}
                                className="polaroid"
                                style={{ padding: 16 }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 6,
                                  }}
                                >
                                  <strong>{post.authorName}</strong>
                                  <span
                                    style={{
                                      color: "var(--slap-purple)",
                                      fontSize: 12,
                                    }}
                                  >
                                    {new Date(post.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p
                                  style={{
                                    margin: 0,
                                    color: "var(--ink)",
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {post.content}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, color: "var(--muted-ink)" }}>
                              This feed is quiet. Start the first conversation.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: "var(--muted-ink)" }}>
                        Join this community to see its feed.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {inviteModal?.open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 11, 35, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="polaroid"
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 20px 50px var(--shadow)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Invite code ready</h3>
            <p style={{ margin: "0 0 12px", color: "var(--muted-ink)" }}>
              Share this with someone to let them join{" "}
              {inviteModal.communityName}.
            </p>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                background: "var(--card-bg)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                marginBottom: 10,
              }}
            >
              {inviteModal.code}
            </div>
            <p style={{ margin: 0, color: "var(--slap-purple)" }}>
              {timeLeftLabel}
            </p>
            <button
              onClick={() => setInviteModal(null)}
              className="slap-button secondary"
              style={{ marginTop: 16, padding: "10px 14px" }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255, 154, 39, 0.18)",
  background: "var(--card-bg)",
  color: "var(--ink)",
};

const menuButtonStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255, 154, 39, 0.2)",
  cursor: "pointer",
  fontWeight: 700,
};

const iconButtonStyle: React.CSSProperties = {
  border: "none",
  background: "var(--panel-bg)",
  color: "var(--foreground)",
  padding: "8px 10px",
  borderRadius: 999,
  cursor: "pointer",
};
