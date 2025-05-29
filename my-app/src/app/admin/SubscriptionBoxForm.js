"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { API } from "@/api/apiHandler"

export default function SubscriptionBoxForm({ initialData, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await API({}, "/v1/subscription/getCategories", "GET")
      if (response && response.data) {
        setCategories(response.data)
      } else {
        setCategories([])
        console.warn("No categories found in the response")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories")
    }
  }

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id || "",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Box Name is required"),
      description: Yup.string().required("Description is required"),
      category_id: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      setError(null)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error("Form submission error:", error)
        setError("An error occurred while submitting the form")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Box Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 border rounded-md ${formik.touched.name && formik.errors.name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={4}
            className={`w-full p-2 border rounded-md ${formik.touched.description && formik.errors.description ? "border-red-500" : "border-gray-300"
              }`}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formik.values.category_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 border rounded-md ${formik.touched.category_id && formik.errors.category_id ? "border-red-500" : "border-gray-300"
              }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formik.touched.category_id && formik.errors.category_id && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.category_id}</p>
          )}
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formik.values.is_active}
            onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Saving..." : initialData ? "Update Box" : "Create Box"}
        </button>
      </div>

    </form>
  )
}
