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
    { title: "Products", path: "/admin/products" },
    { title: "Orders", path: "/admin/orders" },
  ]

  return (
    <nav className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          <Link
            href="/"
            className={`inline-flex items-center px-1 pt-1 text-lg font-bold tracking-wide ${
              pathname === "/" 
                ? "text-blue-700"
                : "text-gray-900 hover:text-blue-800"
            }`}
            aria-label="SubscribeBox Home"
          >
           SubscribeBox
          </Link>
          <div className="flex space-x-4">
            {loggedIn && !adminUser && (
              <>
                <Link
                  href="/subscriptions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/subscriptions"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  My Subscriptions
                </Link>
                <Link
                  href="/orders"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/orders"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/payment-history"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/payment-history"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Payment History
                </Link>
              </>
            )}
            {adminUser &&
              adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.path
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
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
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/profile"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-700 hover:border-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/login"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/signup"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-blue-600 hover:text-blue-800 hover:border-blue-300"
                  }`}
                >
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
