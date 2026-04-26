import "./globals.css";
export const metadata = { title: "Nong Nam AI Companion", description: "Voice companion MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body>{children}</body></html>;
}
