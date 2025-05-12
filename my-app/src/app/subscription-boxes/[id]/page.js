"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { API, isUserLogIn, isAdmin } from "@/api/apiHandler"

export default function SubscriptionBoxDetails() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [box, setBox] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState("") 
  const [address, setAddress] = useState("")

  useEffect(() => {
    fetchBoxDetails()
  }, [id])

  const fetchBoxDetails = async () => {
    setLoading(true)
    try {
      const response = await API(null, `/v1/subscription/box/${id}`, "GET")

      if (response.code == 1) {
        setBox(response.data)
        if (response.data?.plans?.length > 0) {
          setSelectedPlan(response.data.plans[0])
        }
      } else {
        setError(response.message || "Failed to fetch subscription box details")
      }
      setLoading(false)
    } catch {
      setError("An error occurred while fetching subscription box details")
    } 
  }

  // const handlePlanSelect = (plan) => {
  //   setSelectedPlan(plan)
  // }

  const handleSubscribe = async () => {
    if (!isUserLogIn()) {
      router.push("/login")
      return
    }

    if (isAdmin()) {
      router.push("/admin/dashboard")
      return
    }

    if (!address) {
      setSubscribeMessage("Please enter your shipping address")
      return
    }

    if (!selectedPlan) {
      setSubscribeMessage("Please select a subscription plan")
      return
    }

    setSubscribing(true)
    setSubscribeMessage("")

    try {
      const response = await API(
        { plan_id: selectedPlan.id, payment_method: "cash", address },
        "/v1/subscription/subscribe",
        "POST"
      )
      if (response.code == 1) {
        setSubscribeMessage("Successfully subscribed to the box!")
        router.push("/subscriptions")
      } else {
        setSubscribeMessage(response.message || "Failed to subscribe.")
      }
    } catch {
      setSubscribeMessage("An error occurred. Please try again.")
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return <div className="text-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>
  }

  if (!box) {
    return <div className="text-center p-4">Subscription box not found.</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-2">{box.name}</h1>
      <p className="mb-4">{box.description}</p>

      <h2 className="font-medium mb-2">Choose Your Subscription Plan</h2>
      <div className="grid gap-2 mb-4">
        {box.plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-2 border cursor-pointer ${
              selectedPlan?.id === plan.id ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className="font-medium">{plan.name}</h3>
            <p>{plan.months} {plan.months === 1 ? "month" : "months"}</p>
            <p>Rs.{plan.price}</p>
            {plan.products && plan.products.length > 0 && (
              <ul className="mt-2 text-sm list-disc list-inside">
                {plan.products.map((product) => (
                  <li key={product.id}>{product.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-medium mb-2">Shipping Address</h2>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter your shipping address"
        className="w-full p-2 border mb-4"
        rows={3}
      />

      {subscribeMessage && (
        <div className={`mb-4 text-sm`}>
          {subscribeMessage}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => router.back()} className="px-4 py-2 border text-sm">Back</button>
        <button
          onClick={handleSubscribe}
          disabled={subscribing || !selectedPlan}
          className={`px-4 py-2 text-sm ${
            subscribing || !selectedPlan ? "bg-gray-300 text-gray-700" : "bg-blue-500 text-white"
          }`}
        >
          {subscribing ? "Subscribing..." : "Subscribe Now"}
        </button>
      </div>
    </div>
  )
}
