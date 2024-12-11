import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Story Generator",
  description: "A Next.js application for generating user stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
