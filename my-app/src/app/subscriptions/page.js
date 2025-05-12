"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/api/apiHandler"

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await API(null, "/v1/subscription/user/subscriptions", "GET")
      if (response.code == 1) {
        setSubscriptions(response.data || [])
      } else {
        setError(response.message || "Failed to fetch subscriptions")
      }
    } catch (err) {
      setError("An error occurred while fetching your subscriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (id) => {
    setCancellingId(id)
    setMessage({ type: "", text: "" })

    try {
      const response = await API(null, `/v1/subscription/cancel/${id}`, "POST")
      if (response.code == 1) {
        setMessage({ type: "success", text: "Subscription cancelled successfully." })
        fetchSubscriptions()
      } else {
        setMessage({ type: "error", text: response.message || "Failed to cancel subscription." })
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while cancelling your subscription." })
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Subscriptions</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {message.text && (
        <div className={`mb-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">You do not have any active subscriptions yet.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Browse Subscription Boxes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border p-4 rounded">
              <h2 className="text-lg font-bold">{subscription.box_name}</h2>
              <p className="text-sm text-gray-600">{subscription.description}</p>
              <div className="mt-2">
                <p>Plan: {subscription.plan_name}</p>
                <p>Month: {subscription.months}</p>
                <p>Price: ${subscription.price}</p>
                <p>Started: {new Date(subscription.start_date).toLocaleDateString("en-GB")}</p>
                <p>Ends: {new Date(subscription.end_date).toLocaleDateString("en-GB")}</p>
                <p>Status: {subscription.status}</p>
              </div>
              {subscription.status === "active" && (
                <button
                  onClick={() => handleCancelSubscription(subscription.id)}
                  disabled={cancellingId === subscription.id}
                  className="mt-2 text-red-600"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
