"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import { Plus, Edit, Trash, Package, Filter } from "lucide-react"
import ProductForm from "../productForm"

export default function AdminProducts() {
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [selectedBox, setSelectedBox] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchSubscriptionBoxes()
  }, [])

  useEffect(() => {
    if (selectedPlan) {
      fetchProducts(selectedPlan.id)
    } else {
      setProducts([])
    }
  }, [selectedPlan])

  const fetchSubscriptionBoxes = async () => {
    setLoading(true)
    try {
      const response = await API(null, "/v1/subscription/boxes", "POST")

      if (response.code == 1) {
        setSubscriptionBoxes(response.data || [])
        if (response.data && response.data.length > 0) {
          setSelectedBox(response.data[0])
          if (response.data[0].plans && response.data[0].plans.length > 0) {
            setSelectedPlan(response.data[0].plans[0])
          }
        }
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

  const fetchProducts = async (planId) => {
    setLoading(true)
    try {
      const response = await API({ plan_id: planId }, "/v1/admin/product/get", "POST")
      console.log("Products response:", response)
      if (response.code == 1) {
        setProducts(response.data)
        console.log("Products111111111:", selectedPlan.products)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("An error occurred while fetching products")
    } finally {
      setLoading(false)
    }
  }

  const handleBoxChange = (e) => {
    const boxId = Number.parseInt(e.target.value)
    const box = subscriptionBoxes.find((b) => b.id === boxId)
    setSelectedBox(box)
    setSelectedPlan(box.plans && box.plans.length > 0 ? box.plans[0] : null)
  }

  const handlePlanChange = (e) => {
    const planId = Number.parseInt(e.target.value)
    const plan = selectedBox.plans.find((p) => p.id === planId)
    setSelectedPlan(plan)
  }

  const handleAddNew = () => {
    if (!selectedPlan) {
      setMessage({
        type: "error",
        text: "Please select a subscription plan first",
      })
      return
    }
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await API({ product_id: productId }, "/v1/admin/product/delete", "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: "Product deleted successfully.",
        })
        // Refresh the products
        if (selectedPlan) {
          fetchProducts(selectedPlan.id)
        }
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to delete product. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      setMessage({
        type: "error",
        text: "An error occurred while deleting the product. Please try again.",
      })
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const endpoint = editingProduct ? "/v1/admin/product/update" : "/v1/admin/product/add"

      const data = editingProduct
        ? { ...formData, product_id: editingProduct.id }
        : { ...formData, plan_id: selectedPlan.id }

      const response = await API(data, endpoint, "POST")

      if (response.code == 1) {
        setMessage({
          type: "success",
          text: `Product ${editingProduct ? "updated" : "added"} successfully.`,
        })
        // Close the modal and refresh the products
        setIsModalOpen(false)
        if (selectedPlan) {
          fetchProducts(selectedPlan.id)
        }
      } else {
        setMessage({
          type: "error",
          text: response.message || `Failed to ${editingProduct ? "update" : "add"} product. Please try again.`,
        })
      }
    } catch (err) {
      console.error(`Error ${editingProduct ? "updating" : "adding"} product:`, err)
      setMessage({
        type: "error",
        text: `An error occurred while ${editingProduct ? "updating" : "adding"} the product. Please try again.`,
      })
    }
  }

  if (loading && subscriptionBoxes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New Product
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

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-medium">Select Subscription Box and Plan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="box" className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Box
            </label>
            <select
              id="box"
              value={selectedBox?.id || ""}
              onChange={handleBoxChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {subscriptionBoxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Plan
            </label>
            <select
              id="plan"
              value={selectedPlan?.id || ""}
              onChange={handlePlanChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!selectedBox || !selectedBox.plans || selectedBox.plans.length === 0}
            >
              {selectedBox && selectedBox.plans && selectedBox.plans.length > 0 ? (
                selectedBox.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (Rs. {plan.price})
                  </option>
                ))
              ) : (
                <option value="">No plans available</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      {!selectedPlan ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Please select a subscription plan to view its products.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Products</h2>
          <p className="text-gray-600 mb-4">This subscription plan does not have any products yet.</p>
          <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{product.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
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

      {/* Modal for Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingProduct ? "Edit Product" : `Add New Product to "${selectedPlan?.name}" Plan`}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>
            </div>
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
