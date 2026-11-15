import type { Metadata } from "next";
import "./style.css";

export const metadata: Metadata = {
  title: "YIX News MCP",
  description: "YIX News uchun Model Context Protocol serveri",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
