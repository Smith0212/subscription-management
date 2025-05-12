"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/api/apiHandler"

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
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">My Orders</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {orders.length === 0 ? (
        <div className="text-center">
          <p className="mb-2">No Orders Yet</p>
          <button
            onClick={() => router.push("/subscription-boxes")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Browse Boxes
          </button>
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Box Name</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-2">#{order.id}</td>
                <td className="p-2">{new Date(order.order_date).toLocaleDateString()}</td>
                <td className="p-2">{order.box_name}</td>
                <td className="p-2">Rs.{order.grand_total}</td>
                <td className="p-2">{order.order_status}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="text-blue-500"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-lg">
            <h2 className="font-bold mb-4">Order #{selectedOrder.id}</h2>
            <p className="mb-2">
              <strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <strong>Status:</strong> {selectedOrder.order_status}
            </p>
            <p className="mb-2">
              <strong>Total:</strong> Rs.{selectedOrder.grand_total}
            </p>
            <p className="mb-2">
              <strong>Payment:</strong> {selectedOrder.payment_method}
            </p>
            <p className="mb-2">
              <strong>Box:</strong> {selectedOrder.box_name}
            </p>
            <p className="mb-4">
              <strong>Address:</strong> {selectedOrder.address || "No address provided"}
            </p>
            <h3 className="font-bold mb-2">Products:</h3>
            <ul className="list-disc pl-5 mb-4">
              {selectedOrder.products.map((product) => (
                <li key={product.id} className="mb-2">
                  <strong>{product.name}:</strong> {product.description}
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseDetails}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}