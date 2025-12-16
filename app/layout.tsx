// app/layout.tsx
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zelr",
  description: "Zelr – AI powered real estate search for Canada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zelrBg text-white">
        {children}
      </body>
    </html>
  );
}