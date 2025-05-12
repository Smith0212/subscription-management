"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { API } from "@/api/apiHandler"

export default function Signup() {
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      country_code: "+91",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
      country_code: Yup.string().matches(/^\+\d+$/, "Invalid country code").required("Country code is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await API(values, "/v1/user/signup", "POST")

        if (response.code == 1) {
          localStorage.setItem("user_token", response.data.user_token)
          localStorage.setItem("user_id", response.data.user_id)
          localStorage.setItem("temp_otp", response.data.otp)

          router.push("/verifyOTP")
        } else {
          setErrors({ general: response.message || "Signup failed. Please try again." })
        }
        setSubmitting(false)
      } catch (err) {
        setErrors({ general: "An error occurred. Please try again." })
        console.error(err)
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        <h2 className="text-center text-2xl font-bold">Create your account</h2>
        <form className="mt-4" onSubmit={formik.handleSubmit}>
          <div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded mb-2"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full p-2 border rounded mb-2"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            )}
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded mb-2"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm">{formik.errors.password}</div>
            )}
          </div>
          <div className="flex">
            <input
              id="country_code"
              name="country_code"
              type="text"
              placeholder="+91"
              className="w-1/4 p-2 border rounded mr-2"
              value={formik.values.country_code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              className="w-3/4 p-2 border rounded"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.country_code && formik.errors.country_code && (
            <div className="text-red-500 text-sm">{formik.errors.country_code}</div>
          )}
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-red-500 text-sm">{formik.errors.phone}</div>
          )}
          {formik.errors.general && <div className="text-red-500 text-sm">{formik.errors.general}</div>}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full p-2 bg-blue-500 text-white rounded mt-4"
          >
            {formik.isSubmitting ? "Creating account..." : "Sign up"}
          </button>
          <div className="text-center mt-2">
            <Link href="/login" className="text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
