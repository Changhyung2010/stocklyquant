import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "StocklyQuant",
  description: "Quantitative stock analysis with Fama-French factors and AI insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if server-side env keys are set (passed to client as prop)
  const envKeysSet = !!(
    process.env.POLYGON_API_KEY &&
    process.env.FMP_API_KEY
  );

  return (
    <html lang="en">
      <body>
        <AppProvider envKeysSet={envKeysSet}>{children}</AppProvider>
      </body>
    </html>
  );
}
