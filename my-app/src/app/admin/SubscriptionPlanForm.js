"use client"

import { useFormik } from "formik"
import * as Yup from "yup"

export default function SubscriptionPlanForm({ initialData, onSubmit, onCancel }) {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "monthly",
      months: initialData?.months || 1,
      price: initialData?.price || "",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Plan type is required"),
      months: Yup.number()
        .min(1, "Duration must be at least 1 month")
        .required("Duration is required"),
      price: Yup.number()
        .min(0, "Price must be a positive number")
        .required("Price is required"),
      is_active: Yup.boolean(),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error("Form submission error:", error)
        setErrors({ submit: "An error occurred while submitting the form" })
      } finally {
        setSubmitting(false)
      }
    },
  })

  const handleNameChange = (e) => {
    const value = e.target.value
    const months = value === "monthly" ? 1 : 3
    formik.setFieldValue("name", value)
    formik.setFieldValue("months", months)
  }

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
            Plan Type *
          </label>
          <select
            id="name"
            name="name"
            value={formik.values.name}
            onChange={handleNameChange}
            onBlur={formik.handleBlur}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="months" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (months) *
          </label>
          <input
            type="number"
            id="months"
            name="months"
            value={formik.values.months}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            min={1}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.months && formik.errors.months && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.months}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price  *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
            min={0}
            step={0.01}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.price && formik.errors.price && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
          )}
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
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {formik.isSubmitting ? "Saving..." : initialData ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </form>
  )
}
