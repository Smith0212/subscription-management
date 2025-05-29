"use client"

import { useFormik } from "formik"
import * as Yup from "yup"

export default function ProductForm({ initialData, onSubmit, onCancel }) {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "Food",
      image: initialData?.image || "",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Product name is required"),
      description: Yup.string().required("Description is required"),
      type: Yup.string().oneOf(["Food", "Cosmetic", "Electronics"]).required("Product type is required"),
      image: Yup.string().url("Must be a valid URL").nullable().notRequired(),
      is_active: Yup.boolean(),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(values)
      } catch (error) {
        setErrors({ submit: "An error occurred while submitting the form" })
      } finally {
        setSubmitting(false)
      }
    },
    enableReinitialize: true,
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-6">
        {formik.errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formik.errors.submit}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
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
            required
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Product Type *
          </label>
          <select
            id="type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="Food">Food</option>
            <option value="Cosmetic">Cosmetics</option>
            <option value="Electronics">Electronics</option>
          </select>
          {formik.touched.type && formik.errors.type && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.type}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formik.values.image}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://example.com/image.jpg"
          />
          {formik.touched.image && formik.errors.image && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.image}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Leave empty if no image is available</p>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formik.values.is_active}
            onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
            onBlur={formik.handleBlur}
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
          disabled={formik.isSubmitting}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {formik.isSubmitting ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  )
}
