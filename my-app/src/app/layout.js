import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Subscription Box Management",
  description: "Browse and subscribe to premium subscription boxes",
}

export default function RootLayout({ children }) {
  const isVerifyOtpPage = typeof window !== "undefined" && window.location.pathname === "/verifyOTP"

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          {!isVerifyOtpPage && <Navbar />}
          <main className="flex-grow bg-gray-50">{children}</main>
          {!isVerifyOtpPage && <Footer />}
        </div>
      </body>
    </html>
  )
}
