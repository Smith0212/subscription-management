"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const endpoint = '/v1/admin/orders'
      const response = await API(null, endpoint, "GET")

      if (response.code == 1) {
        setOrders(response.data || [])
      } else {
        setError(response.message || "Failed to fetch orders")
      }
    } catch (err) {
      setError("An error occurred while fetching orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await API({ order_id: orderId, order_status: status }, "/v1/admin/order/update-status", "POST")

      if (response.code == 1) {
        setMessage("Order status updated successfully.")
        fetchOrders()
      } else {
        setMessage(response.message || "Failed to update order status.")
      }
    } catch (err) {
      setMessage("An error occurred while updating the order status.")
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Manage Orders</h1>

      {message && <div className="p-2 mb-4 bg-gray-200">{message}</div>}

      {error && <div className="p-2 mb-4 bg-red-200">{error}</div>}

      {orders.length === 0 ? (
        <div className="p-4 bg-gray-100 text-center">No orders found.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Order ID</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Customer</th>
              <th className="border px-2 py-1">Box Name</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border px-2 py-1">#{order.id}</td>
                <td className="border px-2 py-1">{new Date(order.order_date).toLocaleDateString("en-GB")}</td>
                <td className="border px-2 py-1">{order.user_name}</td>
                <td className="border px-2 py-1">{order.box_name}</td>
                <td className="border px-2 py-1">Rs.{order.grand_total}</td>
                <td className="border px-2 py-1">{order.order_status}</td>
                <td className="border px-2 py-1">
                  {order.order_status !== "delivered" && (
                    <div>
                      {order.order_status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "shipped")}
                          className="text-blue-600"
                        >
                          update to shipped
                        </button>
                      )}
                      {order.order_status === "shipped" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "delivered")}
                          className="text-green-600"
                        >
                          update to delivered
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
