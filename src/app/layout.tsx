import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIP Brasil · Provas",
  description: "Sistema de provas TIP Brasil",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
