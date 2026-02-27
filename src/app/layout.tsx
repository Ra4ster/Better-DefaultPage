import "./globals.css";
import { ThemeProviderLite } from "@/components/theme-provider-lite";

export const metadata = {
  title: "Better DefaultPage",
  description: "A clean new tab page with headlines, notes, and quick links.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviderLite>{children}</ThemeProviderLite>
      </body>
    </html>
  );
}