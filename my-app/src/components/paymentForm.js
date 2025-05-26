"use client"

import { useState, useEffect, useRef } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { API } from "@/api/apiHandler"
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function PaymentForm({ amount, orderId, subscriptionId, onPaymentSuccess, onPaymentError }) {
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use ref to track if payment intent has been created
  const paymentIntentCreated = useRef(false)
  // Use ref to track the current request to prevent duplicate calls
  const createIntentRequest = useRef(null)

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createPaymentIntent = async () => {
      // Prevent duplicate calls
      if (paymentIntentCreated.current || createIntentRequest.current) {
        console.log("Payment intent already created or in progress, skipping...")
        return
      }

      setLoading(true)
      setError(null)
      paymentIntentCreated.current = true

      try {
        const data = {
          amount,
          order_id: orderId,
          subscription_id: subscriptionId,
        }
        console.log("Creating payment intent with data:", data)

        // Store the request promise to prevent duplicate calls
        createIntentRequest.current = API(data, "/v1/payment/create-intent", "POST")
        const response = await createIntentRequest.current
        
        console.log("Payment intent response:", response)
        if (response.code == 1) {
          setClientSecret(response.data.clientSecret)
        } else {
          setError(response.message || "Failed to initialize payment")
          paymentIntentCreated.current = false // Reset on error
        }
      } catch (err) {
        console.error("Payment intent error:", err)
        setError("An error occurred while initializing payment")
        paymentIntentCreated.current = false // Reset on error
      } finally {
        setLoading(false)
        createIntentRequest.current = null // Clear the request reference
      }
    }

    // Only create payment intent if we have an amount and haven't created one yet
    if (amount && !paymentIntentCreated.current) {
      createPaymentIntent()
    }

    // Cleanup function to reset refs if component unmounts
    return () => {
      if (createIntentRequest.current) {
        createIntentRequest.current = null
      }
    }
  }, [amount, orderId, subscriptionId]) // Include all dependencies

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#4f46e5",
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">Payment initialization failed</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold">Payment Details</h2>
      </div>

      {/* checkout form */}
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm amount={amount} onPaymentSuccess={onPaymentSuccess} onPaymentError={onPaymentError} />
        </Elements>
      )}
    </div>
  )
}

function CheckoutForm({ amount, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return
    }

    setIsProcessing(true)
    setMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-result`,
      },
      redirect: "if_required",
    })
    
    console.log("Payment Intent Result:", paymentIntent)
    console.log("Payment Error:", error)

    if (error) {
      setMessage(error.message)
      if (onPaymentError) {
        onPaymentError(error)
      }
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment successful!")
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentIntent)
      }
    } else {
      setMessage("An unexpected error occurred.")
    }

    setIsProcessing(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="text-lg font-medium mb-2">Amount: ${amount}</p>
      </div>

      <PaymentElement id="payment-element" className="mb-6" />

      {message && (
        <div
          className={`p-3 rounded mb-4 ${message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.includes("successful") ? (
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{message}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isProcessing ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  )
}