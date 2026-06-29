"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const createPost = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    const user = sessionData.session?.user;

    const { error } = await supabase.from("posts").insert({
      content,
      user_id: user?.id,
    });

    if (error) {
      console.log("INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    setContent("");
    loadPosts();
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Feed</h1>

      <input
        placeholder="Write post"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={createPost}>Post</button>

      <div>
        {posts.map((p) => (
          <div key={p.id} style={{ marginTop: 10 }}>
            {p.content}
          </div>
        ))}
      </div>
    </main>
  );
}