"use client"

import { useState, useEffect } from "react"
import { API } from "@/api/apiHandler"
import SubscriptionBoxCard from "@/components/SubscriptionBoxCard"

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [subscriptionBoxes, setSubscriptionBoxes] = useState([])
  const [loading, setLoading] = useState(true)
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
      console.log("Response:", response)

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

  useEffect(() => {
    fetchCategories()
  }, [])

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
          <h1 className="text-4xl font-bold mb-4">Subscription Boxes</h1>
        </div>

        <div className="p-4 border rounded mb-8">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <div className="absolute left-2 top-2">
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search..."
                className="pl-8 p-2 border rounded w-full"
              />
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border rounded w-full text-left"
            >
              {isOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {isOpen && (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
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
                <label htmlFor="price" className="block text-sm mb-1">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    placeholder="Min"
                    className="p-2 border rounded w-1/2"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max"
                    className="p-2 border rounded w-1/2"
                  />
                </div>
              </div>

              {/* <div>
                <label htmlFor="frequency" className="block text-sm mb-1">
                  Number of Months
                </label>
                <input
                  type="number"
                  name="frequency"
                  value={filters.frequency}
                  onChange={handleChange}
                  placeholder="Enter number of months"
                  className="p-2 border rounded w-full"
                />
              </div> */}

              <div className="flex justify-end">
                <button
                  onClick={handleReset}
                  className="p-2 border rounded"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
