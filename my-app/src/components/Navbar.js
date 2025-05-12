"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { API, isUserLogIn, isAdmin } from "@/api/apiHandler"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [adminUser, setAdminUser] = useState(false)

  useEffect(() => {
    setLoggedIn(isUserLogIn())
    setAdminUser(isAdmin())
  }, [pathname])

  const handleLogout = async () => {
    try {
      const response = await API({}, "/v1/user/logout", "POST")
      if (response.code == 1) {
        localStorage.clear()
        setLoggedIn(false)
        setAdminUser(false)
        router.push("/login")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const adminMenuItems = [
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Subscription Boxes", path: "/admin/subscription-boxes" },
    { title: "Subscription Plans", path: "/admin/subscription-plans" },
    { title: "Orders", path: "/admin/orders" },
  ]

  return (
    <nav className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          <Link href="/" className="text-lg font-semibold">
            SubscribeBox
          </Link>
          <div className="flex space-x-4">
            {loggedIn && !adminUser && (
              <>
                <Link
                  href="/subscriptions"
                  className={`text-sm ${pathname === "/subscriptions" ? "font-bold" : "text-gray-600"}`}
                >
                  My Subscriptions
                </Link>
                <Link
                  href="/orders"
                  className={`text-sm ${pathname === "/orders" ? "font-bold" : "text-gray-600"}`}
                >
                  Orders
                </Link>
              </>
            )}
            {adminUser &&
              adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm ${pathname === item.path ? "font-bold" : "text-gray-600"}`}
                >
                  {item.title}
                </Link>
              ))}
          </div>
          <div className="flex space-x-2">
            {loggedIn ? (
              <>
                <Link
                  href="/profile"
                  className={`text-sm ${pathname === "/profile" ? "font-bold" : "text-gray-600"}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600">
                  Login
                </Link>
                <Link href="/signup" className="text-sm text-blue-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
