"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await API(null, "/v1/admin/dashboard", "GET")
      if (response.code == 1) {
        setAnalytics(response.data)
      } else {
        setError(response.message || "Failed to fetch analytics data")
      }
    } catch (err) {
      setError("An error occurred while fetching analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="border p-4">
          <p>Active Subscriptions</p>
          <h3 className="text-lg font-bold">{analytics?.active_subscriptions || 0}</h3>
        </div>
        <div className="border p-4">
          <p>Total Orders</p>
          <h3 className="text-lg font-bold">{analytics?.total_orders || 0}</h3>
        </div>
        <div className="border p-4">
          <p>Total Revenue</p>
          <h3 className="text-lg font-bold">Rs.{analytics?.total_revenue || 0}</h3>
        </div>
      </div>
      <div className="border p-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Subscriptions by Plan Type</h2>
        {analytics?.subscription_by_plan && analytics.subscription_by_plan.length > 0 ? (
          <div>
            {analytics.subscription_by_plan.map((plan, index) => (
              <div key={index} className="border p-2 mb-2">
                <span>{plan.name}</span>
                <span className="float-right">{plan.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No subscription plan data available</p>
        )}
      </div>
    </div>
  )
}
