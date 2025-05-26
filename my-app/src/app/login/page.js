"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { API } from "@/api/apiHandler"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await API(formData, "/v1/user/login", "POST")
      console.log("response", response)
      if (response.code == 1) {
        // Check if user is admin and redirect accordingly
        // const userProfile = await API(null, "/v1/user/viewProfile", "GET")
        console.log("userProfile", response.data.role)

        if (response.data.role == "admin") {
          console.log("1111111111")
          localStorage.setItem("admin_token", response.data.user_token)
          localStorage.setItem("admin_id", response.data.user_id)
          localStorage.setItem("admin_role", response.data.role)
          // document.cookie = `admin_token=${response.data.user_token}; path=/; secure; HttpOnly;`
          router.push("/admin/dashboard")
        } else {
          localStorage.setItem("user_token", response.data.user_token)
          localStorage.setItem("user_id", response.data.user_id)
          localStorage.setItem("user_role", response.data.role)
          // document.cookie = `user_token=${response.data.user_token}; path=/; secure; HttpOnly;`
          router.push("/")
        }
      } else {
        setError(response.message || "Login failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
