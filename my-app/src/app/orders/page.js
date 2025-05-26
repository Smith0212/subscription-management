"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/api/apiHandler"
import { Package, Truck } from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await API(null, "/v1/order/user/orders", "GET")

      if (response.code == 1) {
        setOrders(response.data || [])
      } else {
        setError(response.message || "Failed to fetch orders")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("An error occurred while fetching your orders")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await API(null, `/v1/order/details/${orderId}`, "GET")

      if (response.code == 1) {
        setSelectedOrder(response.data)
      } else {
        setError(response.message || "Failed to fetch order details")
      }
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("An error occurred while fetching the order details")
    }
  }

  const handleViewDetails = (orderId) => {
    fetchOrderDetails(orderId)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
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
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
          <button
            onClick={() => router.push("/subscription-boxes")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Subscription Boxes
          </button>
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
                    <td className="px-6 py-4 whitespace-nowrap">{order.box_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.grand_total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.order_status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.order_status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleViewDetails(order.id)} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>
                <button onClick={handleCloseDetails} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Status</p>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1 text-blue-500" />
                      <p>{selectedOrder.order_status.charAt(0).toUpperCase() + selectedOrder.order_status.slice(1)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">${selectedOrder.grand_total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="capitalize">{selectedOrder.payment_method}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Subscription Details</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-lg">{selectedOrder.box_name}</h4>
                  <p className="text-gray-600">{selectedOrder.description}</p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Plan:</p>
                    <p className="capitalize">{selectedOrder.plan_name}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Products</h3>
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  <ul className="border divide-y rounded-md">
                    {selectedOrder.products.map((product) => (
                      <li key={product.id} className="p-3 flex items-start">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                        <div className="text-sm text-gray-500 capitalize">{product.type}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No products information available</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
                <p className="bg-gray-50 p-3 rounded">{selectedOrder.address || "No address provided"}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
