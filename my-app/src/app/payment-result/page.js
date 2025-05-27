"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("processing")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Get redirect_status from URL
    const redirectStatus = searchParams.get("redirect_status")

    if (redirectStatus === "succeeded") {
      setStatus("success")
      setMessage("Your payment was successful! You can now view your subscription details.")
    } else if (redirectStatus === "processing") {
      setStatus("processing")
      setMessage("Your payment is processing. We'll update you when the payment is complete.")
    } else if (redirectStatus === "requires_payment_method") {
      setStatus("failed")
      setMessage("Your payment was not successful. Please try again with a different payment method.")
    } else {
      setStatus("unknown")
      setMessage("We couldn't determine the status of your payment. Please check your account for details.")
    }
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "processing" && (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            )}
            {(status === "failed" || status === "unknown") && <XCircle className="h-16 w-16 text-red-500" />}
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {status === "success" && "Payment Successful"}
            {status === "processing" && "Payment Processing"}
            {status === "failed" && "Payment Failed"}
            {status === "unknown" && "Payment Status Unknown"}
          </h1>

          <p className="text-gray-600 text-center mb-6">{message}</p>

          <div className="flex justify-center space-x-4">
            {status === "success" && (
              <Link href="/subscriptions" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Subscriptions
              </Link>
            )}
            {(status === "failed" || status === "unknown") && (
              <Link
                href="/subscription-boxes"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </Link>
            )}
            <Link href="/" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentResult() {
  return (
    <Suspense>
      <PaymentResultContent />
    </Suspense>
  )
}
