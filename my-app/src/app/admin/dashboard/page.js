"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import { Box, ShoppingBag, Users, DollarSign, TrendingUp, Calendar } from "lucide-react"

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
      console.error("Error fetching analytics:", err)
      setError("An error occurred while fetching analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Subscriptions Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Subscriptions</p>
              <h3 className="text-2xl font-bold">{analytics?.active_subscriptions || 0}</h3>
            </div>
          </div>
          <div className="text-green-600 text-sm flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Active users with subscriptions</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold">{analytics?.total_orders || 0}</h3>
            </div>
          </div>
          <div className="text-blue-600 text-sm flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>All time order count</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold">${analytics?.total_revenue || 0}</h3>
            </div>
          </div>
          <div className="text-purple-600 text-sm flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Total revenue from all orders</span>
          </div>
        </div>
      </div>

      {/* Subscription by Plan */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Subscriptions by Plan Type</h2>
        {analytics?.subscription_by_plan && analytics.subscription_by_plan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.subscription_by_plan.map((plan, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Box className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium capitalize">{plan.name}</span>
                  </div>
                  <div className="text-lg font-bold">{plan.count}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No subscription plan data available</p>
        )}
      </div>
    </div>
  )
}
