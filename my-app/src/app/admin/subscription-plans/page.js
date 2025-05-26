"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import { Plus, Edit, Trash, Calendar } from "lucide-react"
import SubscriptionPlanForm from "../SubscriptionPlanForm"

export default function AdminSubscriptionPlans() {
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)
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
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) {
      return
    }

    try {
      const response = await API({ plan_id: planId }, "/v1/admin/subscription/plan/delete", "POST")

      if (response.code === 1) {
        setMessage({
          type: "success",
          text: "Subscription plan deleted successfully.",
        })
        // Refresh the list
        fetchSubscriptionBoxes()
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to delete subscription plan. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error deleting subscription plan:", err)
      setMessage({
        type: "error",
        text: "An error occurred while deleting the subscription plan. Please try again.",
      })
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = editingPlan ? "/v1/admin/subscription/plan/update" : "/v1/admin/subscription/plan/create"

      const data = editingPlan ? { ...formData, plan_id: editingPlan.id } : { ...formData, box_id: currentBox.id }

      const response = await API(data, endpoint, "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: `Subscription plan ${editingPlan ? "updated" : "created"} successfully.`,
        })

        setIsModalOpen(false)
        fetchSubscriptionBoxes()
      } else {
        setMessage({
          type: "error",
          text:
            response.message || `Failed to ${editingPlan ? "update" : "create"} subscription plan. Please try again.`,
        })
      }
    } catch (err) {
      console.error(`Error ${editingPlan ? "updating" : "creating"} subscription plan:`, err)
      setMessage({
        type: "error",
        text: `An error occurred while ${editingPlan ? "updating" : "creating"} the subscription plan. Please try again.`,
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
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>

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
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Subscription Boxes</h2>
          <p className="text-gray-600 mb-4">Create a subscription box before adding plans.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {subscriptionBoxes.map((box) => (
            <div key={box.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">{box.name}</h2>
                <button
                  onClick={() => handleAddNew(box)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Plan
                </button>
              </div>

              {box.plans && box.plans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
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
                      {box.plans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{plan.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium capitalize">{plan.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {plan.months} {plan.months === 1 ? "month" : "months"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">Rs. {plan.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                plan.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                            <button onClick={() => handleEdit(box, plan)} className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-900">
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">No plans created for this subscription box yet.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Subscription Plan */}
      {isModalOpen && currentBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingPlan ? "Edit Subscription Plan" : `Add New Plan to "${currentBox.name}"`}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
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
