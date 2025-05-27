"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { API } from "@/api/apiHandler"
import SubscriptionBoxCard from "@/components/SubscriptionBoxCard"

export default function HomePage() {
  const router = useRouter()

  const [categories, setCategories] = useState([])
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    frequency: "",
  })
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const token = localStorage.getItem("user_token")
    console.log("Token from localStorageeeeeeeeeeeeeeeeeeee:", token)
    if (!token) {
      router.push("/login")
      return
    }
    fetchCategories()
  },[])

  useEffect(() => {
    getSubscriptionBoxes()
  }, [filters])

  const getSubscriptionBoxes = async () => {
    setLoading(true)
    try {
      const body = {
        search: filters.search || undefined,
        category: filters.category || undefined,
        min_price: filters.minPrice || undefined,
        max_price: filters.maxPrice || undefined,
        frequency: filters.frequency || undefined,
      }

      const endpoint = `/v1/subscription/boxes`

      const response = await API(body, endpoint, "POST")
      console.log("Response11111111:", response)

      if (response.code == 1) {
        setSubscriptionBoxes(response.data || [])
      } else {
        setError(response.message || "Failed to fetch subscription boxes")
      }
    } catch (err) {
      console.error("Error fetching subscription boxes:", err)
      setError("error fetching subscription boxes")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await API({}, "/v1/subscription/getCategories", "GET")
      if (response?.data) {
        setCategories(response.data)
      } else {
        setCategories([])
        console.log("No categories found in the response")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }

  const handleReset = () => {
    const resetFilters = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      frequency: "",
    }
    setFilters(resetFilters)
    // handleFilterChange(resetFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Subscription Boxes</h1>
          <p className="text-gray-600">Discover the best subscription boxes tailored to your needs.</p>
        </div>

        <div className="p-6 border rounded-lg shadow-md bg-gray-50 mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search..."
                className="pl-10 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 border rounded-lg w-full text-left bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {isOpen && (
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    placeholder="Min"
                    className="p-3 border rounded-lg w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max"
                    className="p-3 border rounded-lg w-1/2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleReset}
                  className="p-3 border rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        ) : subscriptionBoxes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No subscription boxes found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionBoxes.map((box) => (
              <SubscriptionBoxCard key={box.id} box={box} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
