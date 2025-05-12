"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { API } from "@/api/apiHandler"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

export default function Login() {
  const router = useRouter()

  const initialValues = {
    email: "",
    password: "",
  }

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(3, "Password must be at least 6 characters").required("Password is required"),
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await API(values, "/v1/user/login", "POST")
      if (response.code == 1) {
        if (response.data.role == "admin") {
          localStorage.setItem("admin_token", response.data.user_token)
          localStorage.setItem("admin_id", response.data.user_id)
          localStorage.setItem("admin_role", response.data.role)
          router.push("/admin/dashboard")
        } else {
          localStorage.setItem("user_token", response.data.user_token)
          localStorage.setItem("user_id", response.data.user_id)
          localStorage.setItem("user_role", response.data.role)
          router.push("/")
        }
      } else {
        setFieldError("general", response.message || "Login failed. Please try again.")
      }
    } catch (err) {
      setFieldError("general", "An error occurred. Please try again.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-4 shadow-md">
        <h2 className="text-center text-xl font-bold mb-4">Sign in</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <div className="mb-4">
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mb-4">
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              {errors.general && <div className="text-red-500 text-sm mb-4">{errors.general}</div>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
              <div className="text-center mt-4 text-sm">
                <Link href="/signup" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
