"use client";

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setIsAuthenticated(Boolean(data.session));
      }
    };

    void checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(session));
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          background: "var(--paper-bg)",
          color: "var(--ink)",
          fontFamily: "Arial, Helvetica, sans-serif",
          minHeight: "100vh",
        }}
      >
        <nav className="top-nav">
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
            }}
          >
            <Link href="/" className="brand">
              The Click
            </Link>
            <Link href="/feed" className="nav-link">
              Feed
            </Link>
            <Link href="/communities" className="nav-link">
              Communities
            </Link>
            <Link href="/profile" className="nav-link">
              Profile
            </Link>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="nav-link">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="slap-button secondary"
                    style={{ padding: "6px 12px" }}
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  style={{
                    background: "var(--accent-red)",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 10,
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
