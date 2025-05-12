"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import { API } from "@/api/apiHandler"

export default function VerifyOTP() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const token = localStorage.getItem("user_token")

    if (!userId || !token) {
      router.push("/signup")
      return
    }
  }, [router])

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("OTP is required")
        .matches(/^\d{4}$/, "OTP must be a 4-digit number"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      setError("")

      try {
        const response = await API({ otp: values.otp }, "/v1/user/verifyOtp", "POST")

        if (response.code == 1) {
          router.push("/login")
        } else {
          setError(response.message || "OTP verification failed. Please try again.")
        }
        setLoading(false)

      } catch (err) {
        setError("An error occurred. Please try again.")
        console.error(err)
      } 
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">
        <h2 className="text-center text-xl font-bold">Verify OTP</h2>
        <p className="text-center text-sm text-gray-600">Check your email and phone for the code</p>
        <form className="mt-4" onSubmit={formik.handleSubmit}>
          <div>
            <input
              id="otp"
              name="otp"
              type="text"
              className={`w-full p-2 border ${
                formik.touched.otp && formik.errors.otp ? "border-red-500" : "border-gray-300"
              } rounded`}
              placeholder="Enter OTP"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.otp && formik.errors.otp && (
              <div className="text-red-500 text-sm">{formik.errors.otp}</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  )
}
