"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import { Check, Filter } from "lucide-react"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchOrders()
  }, [filters])

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
      console.error("Error fetching orders:", err)
      setError("An error occurred while fetching orders")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await API({ order_id: orderId, order_status: status }, "/v1/admin/order/update-status", "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: "Order status updated successfully.",
        })
        // Refresh the orders
        fetchOrders()
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to update order status. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error updating order status:", err)
      setMessage({
        type: "error",
        text: "An error occurred while updating the order status. Please try again.",
      })
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      {message.text && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Box Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString("en-GB")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.user_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.box_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.grand_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full` }
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.order_status !== "delivered" && (
                        <div className="flex space-x-2">
                          {order.order_status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Shipped
                            </button>
                          )}
                          {order.order_status === "shipped" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "delivered")}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
