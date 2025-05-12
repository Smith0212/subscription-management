"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import SubscriptionBoxForm from "../SubscriptionBoxForm"

export default function AdminSubscriptionBoxes() {
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBox, setEditingBox] = useState(null)
  const [message, setMessage] = useState("")

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
    } catch {
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
    if (!window.confirm("Are you sure you want to delete this subscription box?")) return

    try {
      const response = await API({ box_id: boxId }, "/v1/admin/subscription/box/delete", "POST")
      if (response.code == 1) {
        setMessage("Subscription box deleted successfully.")
        fetchSubscriptionBoxes()
      } else {
        setMessage(response.message || "Failed to delete subscription box.")
      }
    } catch {
      setMessage("An error occurred while deleting the subscription box.")
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = editingBox ? "/v1/admin/subscription/box/update" : "/v1/admin/subscription/box/create"
      const data = editingBox ? { ...formData, box_id: editingBox.id } : formData
      const response = await API(data, endpoint, "POST")

      if (response.code == 1) {
        setMessage(`Subscription box ${editingBox ? "updated" : "created"} successfully.`)
        setIsModalOpen(false)
        fetchSubscriptionBoxes()
      } else {
        setMessage(response.message || `Failed to ${editingBox ? "update" : "create"} subscription box.`)
      }
    } catch {
      setMessage(`An error occurred while ${editingBox ? "updating" : "creating"} the subscription box.`)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Subscription Boxes</h1>
        <button onClick={handleAddNew} className="px-4 py-2 bg-blue-500 text-white rounded">Add New</button>
      </div>

      {message && (
        <div className="p-2 mb-4 bg-gray-200">
          {message}
        </div>
      )}

      {error && <div className="p-2 mb-4 bg-red-200">{error}</div>}

      {subscriptionBoxes.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 rounded">
          <p>No Subscription Boxes</p>
          <button onClick={handleAddNew} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Add Subscription Box</button>
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Plans</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionBoxes.map((box) => (
              <tr key={box.id}>
                <td className="p-2 border">{box.id}</td>
                <td className="p-2 border">{box.name}</td>
                <td className="p-2 border">{box.category_name || "Uncategorized"}</td>
                <td className="p-2 border">{box.plans?.length || 0} plans</td>
                <td className="p-2 border">{box.is_active ? "Active" : "Inactive"}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(box)} className="text-blue-500 mr-2">Edit</button>
                  <button onClick={() => handleDelete(box.id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingBox ? "Edit Subscription Box" : "Add Subscription Box"}</h2>
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
