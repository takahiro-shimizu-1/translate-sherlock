import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "シャーロックホームズ調変換",
  description: "テキストをエレガントなイギリス英語とシャーロックホームズの雰囲気に変換します",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between w-full max-w-5xl">
            <div className="font-medium">シャーロックホームズ調変換</div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
