import Link from "next/link"

export default function SubscriptionBoxCard({ box }) {
  const minPrice =
    box.min_price || (box.plans && box.plans.length > 0 ? Math.min(...box.plans.map((plan) => plan.price)) : 0)

  const maxPrice =
    box.max_price || (box.plans && box.plans.length > 0 ? Math.max(...box.plans.map((plan) => plan.price)) : 0)

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold">{box.name}</h3>
      <p className="text-sm text-gray-700 mb-2">{box.description}</p>

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span>
            {minPrice === maxPrice ? `Rs.${minPrice}` : `Rs.${minPrice} - Rs.${maxPrice}`}
          </span>
        </div>
        {box.category_name && (
          <div className="text-xs text-blue-600">{box.category_name}</div>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-2">
        <span>
          {box.plans && box.plans.length > 0 ? box.plans.map((plan) => plan.name).join(", ") : "Plans unavailable"}
        </span>
      </div>

      <Link
        href={`/subscription-boxes/${box.id}`}
        className="block text-center py-1 px-2 bg-blue-500 text-white rounded"
      >
        View Details
      </Link>
    </div>
  )
}
