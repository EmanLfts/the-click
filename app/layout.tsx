export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: 20, borderBottom: "1px solid #ccc" }}>
          <a href="/" style={{ marginRight: 10 }}>Home</a>
          <a href="/feed" style={{ marginRight: 10 }}>Feed</a>
          <a href="/communities" style={{ marginRight: 10 }}>Communities</a>
          <a href="/profile" style={{ marginRight: 10 }}>Profile</a>
        </nav>

        {children}
      </body>
    </html>
  );
}