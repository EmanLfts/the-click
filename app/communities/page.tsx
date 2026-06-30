"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Community = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export default function Communities() {
  const [name, setName] = useState("");
  const [list, setList] = useState<Community[]>([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"create" | "your" | "discover">("discover");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (user) setUserId(user.id);

    load();
  };

  const load = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    setList((data as Community[]) || []);
  };

  const create = async () => {
    if (!userId || !name.trim()) return;

    await supabase.from("communities").insert({
      name,
      owner_id: userId,
    });

    setName("");
    load();
  };

  const yourCommunities = list.filter((c) => c.owner_id === userId);

  return (
    <main style={{ minHeight: "100vh", background: "#060606", color: "#f5ebd7", display: "flex" }}>

      {/* SIDEBAR (1/4) */}
      <aside
        style={{
          width: open ? 280 : 60,
          transition: "0.2s",
          borderRight: "1px solid #3d2b1d",
          background: "#0f0f0f",
          padding: 12,
          overflow: "hidden"
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            background: "#1b1918",
            border: "1px solid #3d2b1d",
            color: "#f5ebd7"
          }}
        >
          ☰
        </button>

        {open && (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <button onClick={() => setView("create")} style={navBtn}>Create communities</button>
            <button onClick={() => setView("your")} style={navBtn}>Your communities</button>
            <button onClick={() => setView("discover")} style={navBtn}>Discover communities</button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <section style={{ flex: 1, padding: 24 }}>

        {view === "create" && (
          <div style={panel}>
            <h2>Create community</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Community name"
              style={input}
            />
            <button onClick={create} style={button}>Create</button>
          </div>
        )}

        {view === "your" && (
          <div style={{ display: "grid", gap: 12 }}>
            <h2>Your communities</h2>
            {yourCommunities.map((c) => (
              <div key={c.id} style={card}>{c.name}</div>
            ))}
          </div>
        )}

        {view === "discover" && (
          <div style={{ display: "grid", gap: 12 }}>
            <h2>Discover communities</h2>
            {list.map((c) => (
              <div key={c.id} style={card}>{c.name}</div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}

const navBtn: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #3d2b1d",
  background: "#1b1918",
  color: "#f5ebd7",
  textAlign: "left"
};

const panel: React.CSSProperties = {
  border: "1px solid #3d2b1d",
  borderRadius: 24,
  padding: 24,
  background: "#121110",
  display: "grid",
  gap: 12,
  maxWidth: 600
};

const card: React.CSSProperties = {
  border: "1px solid #3d2b1d",
  borderRadius: 20,
  padding: 16,
  background: "#121110"
};

const input: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #3d2b1d",
  background: "#1b1918",
  color: "#f7ebd6"
};

const button: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  background: "#f0c36c",
  color: "#111",
  fontWeight: 700,
  cursor: "pointer"
};