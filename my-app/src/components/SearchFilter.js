"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"

export default function SearchFilter({ onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    frequency: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedFilters = { ...filters, [name]: value }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
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
    onFilterChange(resetFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search subscription boxes..."
            className="pl-10 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              <option value="1">Food & Beverage</option>
              <option value="2">Beauty & Cosmetics</option>
              <option value="3">Books & Reading</option>
              <option value="4">Health & Wellness</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="Min"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Max"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={filters.frequency}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Frequencies</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
