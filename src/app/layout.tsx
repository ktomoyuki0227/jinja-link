import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "おまモリ。- 神社 × クリック募金 × 推し活",
  description:
    "神社 × クリック募金 × 推し活で、「あなた」と「神社」をつなぐアプリ",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#EA5455",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
