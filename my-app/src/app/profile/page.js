"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Package } from "lucide-react"
import { API } from "@/api/apiHandler"

export default function ProfilePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "",
  })

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      try {
        // Get Profile
        const profileData = await API(null, "/v1/user/viewProfile", "GET")
        console.log("Profile Data:", profileData)
        if (profileData.code == 1 && profileData.data) {
          setFormData({
            name: profileData.data.name || "",
            email: profileData.data.email || "",
            phone: profileData.data.phone || "",
            countryCode: profileData.data.country_code || "+1",
          })
        } else {
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndOrders()
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage({ type: "", text: "" })

    try {
      const data = await API(
        {
          name: formData.name,
          phone: formData.phone,
          countryCode: formData.countryCode,
        },
        "/v1/user/editProfile",
        "POST"
      )

      if (data.code == 1) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile." })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <User className="mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded mb-4 ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                  <input
                    type="text"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2 border border-gray-200 bg-gray-100 rounded cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${updating ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mt-4">
              <button onClick={() => router.push("/")} className="ml-4 text-blue-600 hover:underline">
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
