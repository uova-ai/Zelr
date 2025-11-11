export const metadata = {
  title: "Zelr — Real Estate AI (Canada)",
  description: "Find Canadian homes with AI insights, Zelr Score, and history.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}