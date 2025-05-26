"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import { Plus, Edit, Trash, Package } from "lucide-react"
import SubscriptionBoxForm from "../SubscriptionBoxForm"

export default function AdminSubscriptionBoxes() {
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBox, setEditingBox] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchSubscriptionBoxes()
  }, [])

  const fetchSubscriptionBoxes = async () => {
    setLoading(true)
    try {
      const response = await API(null, "/v1/subscription/boxes", "POST")

      if (response.code == 1) {
        setSubscriptionBoxes(response.data || [])
      } else {
        setError(response.message || "Failed to fetch subscription boxes")
      }
    } catch (err) {
      console.error("Error fetching subscription boxes:", err)
      setError("An error occurred while fetching subscription boxes")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingBox(null)
    setIsModalOpen(true)
  }

  const handleEdit = (box) => {
    setEditingBox(box)
    setIsModalOpen(true)
  }

  const handleDelete = async (boxId) => {
    if (!window.confirm("Are you sure you want to delete this subscription box?")) {
      return
    }

    try {
      const response = await API({ box_id: boxId }, "/v1/admin/subscription/box/delete", "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: "Subscription box deleted successfully.",
        })
        // Refresh the list
        fetchSubscriptionBoxes()
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to delete subscription box. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error deleting subscription box:", err)
      setMessage({
        type: "error",
        text: "An error occurred while deleting the subscription box. Please try again.",
      })
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = editingBox ? "/v1/admin/subscription/box/update" : "/v1/admin/subscription/box/create"

      const data = editingBox ? { ...formData, box_id: editingBox.id } : formData

      const response = await API(data, endpoint, "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: `Subscription box ${editingBox ? "updated" : "created"} successfully.`,
        })
        // Close the modal and refresh the list
        setIsModalOpen(false)
        fetchSubscriptionBoxes()
      } else {
        setMessage({
          type: "error",
          text: response.message || `Failed to ${editingBox ? "update" : "create"} subscription box. Please try again.`,
        })
      }
    } catch (err) {
      console.error(`Error ${editingBox ? "updating" : "creating"} subscription box:`, err)
      setMessage({
        type: "error",
        text: `An error occurred while ${editingBox ? "updating" : "creating"} the subscription box. Please try again.`,
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Boxes</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Box
        </button>
      </div>

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

      {subscriptionBoxes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Subscription Boxes</h2>
          <p className="text-gray-600 mb-4">Start by creating your first subscription box.</p>
          <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Subscription Box
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plans
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
                {subscriptionBoxes.map((box) => (
                  <tr key={box.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{box.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{box.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{box.category_name || "Uncategorized"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{box.plans?.length || 0} plans</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          box.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {box.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <button onClick={() => handleEdit(box)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(box.id)} className="text-red-600 hover:text-red-900">
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Subscription Box */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingBox ? "Edit Subscription Box" : "Add New Subscription Box"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
            </div>
            <SubscriptionBoxForm
              initialData={editingBox}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
