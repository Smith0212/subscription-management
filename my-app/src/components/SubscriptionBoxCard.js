import { Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function SubscriptionBoxCard({ box }) {
  // Find min and max price from plans
  const minPrice =
    box.min_price || (box.plans && box.plans.length > 0 ? Math.min(...box.plans.map((plan) => plan.price)) : 0)

  const maxPrice =
    box.max_price || (box.plans && box.plans.length > 0 ? Math.max(...box.plans.map((plan) => plan.price)) : 0)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{box.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{box.description}</p>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="font-medium">
              {minPrice === maxPrice ? `Rs. ${minPrice}` : `Rs. ${minPrice} - Rs. ${maxPrice}`}
            </span>
          </div>
          {box.category_name && (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{box.category_name}</div>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {box.plans && box.plans.length > 0 ? box.plans.map((plan) => plan.name).join(", ") : "Plans unavailable"}
          </span>
        </div>

        <Link
          href={`/subscription-boxes/${box.id}`}
          className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
