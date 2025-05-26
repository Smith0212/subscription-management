"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { API, isUserLogIn } from "@/api/apiHandler"
import { CheckCircle, CreditCard, DollarSign } from "lucide-react"
import PaymentForm from "@/components/paymentForm"

export default function SubscriptionBoxDetails() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [box, setBox] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState({ type: "", text: "" })
  const [address, setAddress] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card") // Default to card payment
  const [paymentIntent, setPaymentIntent] = useState(null)

  useEffect(() => {
    fetchBoxDetails()
  }, [id])

  const fetchBoxDetails = async () => {
    setLoading(true)
    try {
      const response = await API(null, `/v1/subscription/box/${id}`, "GET")

      if (response.code == 1) {
        setBox(response.data)
        // Set the first plan as selected by default if available
        if (response.data?.plans && response.data.plans.length > 0) {
          setSelectedPlan(response.data.plans[0])
        }
      } else {
        setError(response.message || "Failed to fetch subscription box details")
      }
    } catch (err) {
      console.error("Error fetching box details:", err)
      setError("An error occurred while fetching subscription box details")
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
  }

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value)
    // Reset payment form if changing payment method
    setShowPaymentForm(false)
    setPaymentIntent(null)
  }

  const handleProceedToPayment = () => {
    if (!isUserLogIn()) {
      router.push("/login" + id)
      return
    }

    if (!selectedPlan) {
      setSubscribeMessage({ type: "error", text: "Please select a subscription plan" })
      return
    }

    if (!address.trim()) {
      setSubscribeMessage({ type: "error", text: "Please enter your shipping address" })
      return
    }

    // Show payment form for card payments
    if (paymentMethod === "card") {
      setShowPaymentForm(true)
    } else {
      // For cash payments, proceed directly
      handleSubscribe()
    }
  }

  const handlePaymentSuccess = (paymentIntentResult) => {
    setPaymentIntent(paymentIntentResult)
    console.log("Payment successful:", paymentIntentResult)
    // Proceed with subscription after successful payment
    handleSubscribe(paymentIntentResult.id)
  }

  const handlePaymentError = (error) => {
    setSubscribeMessage({
      type: "error",
      text: `Payment failed: ${error.message}. Please try again.`,
    })
  }

  const handleSubscribe = async (paymentIntentId = null) => {
    setSubscribing(true)
    setSubscribeMessage({ type: "", text: "" })

    try {
      const subscriptionData = {
        plan_id: selectedPlan.id,
        payment_method: paymentMethod,
        address,
      }

      console.log("Subscription Dataaaaaaaaaa:", subscriptionData)

      // Add payment intent ID if payment was made with card
      if (paymentIntentId) {
        subscriptionData.payment_intent_id = paymentIntentId
      }

      const response = await API(subscriptionData, "/v1/subscription/subscribe", "POST")

      if (response.code == 1) {
        setSubscribeMessage({
          type: "success",
          text: "Successfully subscribed to the box! Your first delivery is on the way.",
        })

        // Redirect to subscriptions page after a delay
        setTimeout(() => {
          router.push("/subscriptions")
        }, 2000)
      } else {
        setSubscribeMessage({
          type: "error",
          text: response.message || "Failed to subscribe to the box. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error subscribing:", err)
      setSubscribeMessage({
        type: "error",
        text: "An error occurred while processing your subscription. Please try again.",
      })
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  if (!box) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Subscription box not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{box.name}</h1>
          <p className="text-gray-600 mb-6">{box.description}</p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose Your Subscription Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {box.plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{plan.name}</h3>
                      <p className="text-gray-600">
                        {plan.months} {plan.months === 1 ? "month" : "months"}
                      </p>
                    </div>
                    <div className="text-xl font-bold">${plan.price}</div>
                  </div>
                  {plan.products && plan.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-700">Includes:</p>
                      <ul className="mt-1">
                        {plan.products.map((product) => (
                          <li key={product.id} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your shipping address"
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {subscribeMessage.text && (
            <div
              className={`p-4 rounded-md mb-6 ${
                subscribeMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {subscribeMessage.text}
            </div>
          )}

          {!showPaymentForm && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={subscribing || !selectedPlan}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  subscribing || !selectedPlan ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {subscribing ? "Processing..." : paymentMethod === "card" ? "Proceed to Payment" : "Subscribe Now"}
              </button>
            </div>
          )}

          {showPaymentForm && paymentMethod === "card" && selectedPlan && (
            <div className="mt-6">
              <PaymentForm
                amount={selectedPlan.price}
                // orderId={box.id}
                // subscriptionId={selectedPlan.id}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
