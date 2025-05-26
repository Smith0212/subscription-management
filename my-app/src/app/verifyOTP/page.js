"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/api/apiHandler"

export default function VerifyOTP() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState(null)
  const [userToken, setUserToken] = useState(null)

  useEffect(() => {
    // Get user_id and token from localStorage
    const storedUserId = localStorage.getItem("user_id")
    const storedToken = localStorage.getItem("user_token")

    if (!storedUserId || !storedToken) {
      router.push("/signup")
      return
    }

    setUserId(storedUserId)
    setUserToken(storedToken)
  }, [router])

  const handleChange = (e) => {
    setOtp(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await API({ otp }, "/v1/user/verifyOtp", "POST")

      if (response.code == 1) {
        // OTP verified successfully, redirect to login
        router.push("/login")
      } else {
        setError(response.message || "OTP verification failed. Please try again.")
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ve sent a verification code to your email and phone
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter OTP"
                value={otp}
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
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
