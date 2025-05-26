"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/api/apiHandler"
import { Package, Calendar, Clock, AlertTriangle, DollarSign } from "lucide-react"

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
      console.error("Error fetching subscriptions:", err)
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
        setMessage({
          type: "success",
          text: "Subscription cancelled successfully.",
        })
        fetchSubscriptions()
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to cancel subscription. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err)
      setMessage({
        type: "error",
        text: "An error occurred while cancelling your subscription. Please try again.",
      })
    } finally {
      setCancellingId(null)
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Subscriptions</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {message.text && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Subscriptions</h2>
          <p className="text-gray-600 mb-4">You do not have any active subscriptions yet.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Subscription Boxes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{subscription.box_name}</h2>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : subscription.status === "cancelled"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subscription.status}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{subscription.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-medium capitalize">{subscription.plan_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">${subscription.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Started</p>
                      <p className="font-medium">
                        {new Date(subscription.start_date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Ends</p>
                      <p className="font-medium">
                        {new Date(subscription.end_date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </div>

                {subscription.status === "active" && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={cancellingId === subscription.id}
                      className={`flex items-center text-red-600 hover:text-red-800`}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
