"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import SubscriptionPlanForm from "../SubscriptionPlanForm"

export default function AdminSubscriptionPlans() {
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)
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
      setError("An error occurred while fetching subscription data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = (box) => {
    setEditingPlan(null)
    setCurrentBox(box)
    setIsModalOpen(true)
  }

  const handleEdit = (box, plan) => {
    setEditingPlan(plan)
    setCurrentBox(box)
    setIsModalOpen(true)
  }

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) return
    try {
      const response = await API({ plan_id: planId }, "/v1/admin/subscription/plan/delete", "POST")
      if (response.code == 1) {
        setMessage("Subscription plan deleted successfully.")
        fetchSubscriptionBoxes()
      } else {
        setMessage(response.message || "Failed to delete subscription plan.")
      }
    } catch {
      setMessage("An error occurred while deleting the subscription plan.")
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = editingPlan ? "/v1/admin/subscription/plan/update" : "/v1/admin/subscription/plan/create"
      const data = editingPlan ? { ...formData, plan_id: editingPlan.id } : { ...formData, box_id: currentBox.id }
      const response = await API(data, endpoint, "POST")
      if (response.code == 1) {
        setMessage(`Subscription plan ${editingPlan ? "updated" : "created"} successfully.`)
        setIsModalOpen(false)
        fetchSubscriptionBoxes()
      } else {
        setMessage(response.message || `Failed to ${editingPlan ? "update" : "create"} subscription plan.`)
      }
    } catch {
      setMessage(`An error occurred while ${editingPlan ? "updating" : "creating"} the subscription plan.`)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Subscription Plans</h1>

      {message && (
        <div className="p-2 mb-4 bg-gray-200">
          {message}
        </div>
      )}

      {error && <div className="bg-red-200 p-2 mb-4">{error}</div>}

      {subscriptionBoxes.length === 0 ? (
        <div className="p-4 text-center">
          <h2 className="font-semibold mb-2">No Subscription Boxes</h2>
          <p>Create a subscription box before adding plans.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptionBoxes.map((box) => (
            <div key={box.id} className="border p-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{box.name}</h2>
                <button onClick={() => handleAddNew(box)} className="bg-blue-500 text-white px-2 py-1 text-sm">
                  Add Plan
                </button>
              </div>

              {box.plans && box.plans.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-1 text-left">ID</th>
                      <th className="p-1 text-left">Plan</th>
                      <th className="p-1 text-left">Duration</th>
                      <th className="p-1 text-left">Price</th>
                      <th className="p-1 text-left">Status</th>
                      <th className="p-1 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.plans.map((plan) => (
                      <tr key={plan.id} className="border-b">
                        <td className="p-1">{plan.id}</td>
                        <td className="p-1">{plan.name}</td>
                        <td className="p-1">{plan.months} {plan.months === 1 ? "month" : "months"}</td>
                        <td className="p-1">Rs.{plan.price}</td>
                        <td className="p-1">{plan.is_active ? "Active" : "Inactive"}</td>
                        <td className="p-1">
                          <button onClick={() => handleEdit(box, plan)} className="text-blue-500 mr-2">Edit</button>
                          <button onClick={() => handleDelete(plan.id)} className="text-red-500">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No plans created for this subscription box yet.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && currentBox && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <h2>{editingPlan ? "Edit Subscription Plan" : `Add New Plan to "${currentBox.name}"`}</h2>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <SubscriptionPlanForm
              initialData={editingPlan}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
