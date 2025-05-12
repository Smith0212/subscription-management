"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
    const fetchProfile = async () => {
      try {
        const profileData = await API(null, "/v1/user/viewProfile", "GET")
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

    fetchProfile()
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
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">My Account</h1>

      {message.text && (
        <div className={`p-2 mb-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Country Code</label>
          <input
            type="text"
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full p-2 border bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={updating}
          className={`w-full p-2 text-white bg-blue-500 rounded ${updating ? "opacity-70" : ""}`}
        >
          {updating ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <button onClick={() => router.push("/")} className="mt-4 text-blue-500 underline">
        Back to home
      </button>
    </div>
  )
}
