import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#060606", color: "#f5ebd7" }}>

        {/* GLOBAL HEADER */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "#0f0f0f",
            borderBottom: "1px solid #3d2b1d",
            padding: "14px 20px"
          }}
        >
          <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

            <div style={{ color: "#c8a462", fontWeight: 700, letterSpacing: "0.2em" }}>
              THE CLICK
            </div>

            <nav style={{ display: "flex", gap: 14 }}>
              <Link href="/" style={{ color: "#f5ebd7", textDecoration: "none" }}>Home</Link>
              <Link href="/feed" style={{ color: "#f5ebd7", textDecoration: "none" }}>Feed</Link>
              <Link href="/communities" style={{ color: "#f5ebd7", textDecoration: "none" }}>Communities</Link>
              <Link href="/profile" style={{ color: "#f5ebd7", textDecoration: "none" }}>Profile</Link>
              <Link href="/login" style={{ color: "#f0c36c", textDecoration: "none" }}>Login</Link>
            </nav>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>

      </body>
    </html>
  );
}