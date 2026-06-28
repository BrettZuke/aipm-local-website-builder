import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Partner Method Content Engine",
  description:
    "Reels, carousels, stories, and long-form scripts written in your voice — anchored to your business, frameworks, and feedback.",
  icons: {
    icon: [
      { url: "/aipm-logo.png", type: "image/png" },
    ],
    shortcut: "/aipm-logo.png",
    apple: "/aipm-logo.png",
  },
  openGraph: {
    title: "AI Partner Method Content Engine",
    description: "Original scripts in your voice, every time.",
    images: ["/aipm-logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Partner Method Content Engine",
    description: "Original scripts in your voice, every time.",
    images: ["/aipm-logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
