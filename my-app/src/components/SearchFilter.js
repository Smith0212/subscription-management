"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"

export default function SearchFilter({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="p-4 border rounded">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <div className="absolute left-2 top-2">
            <Search className="h-4 w-4" />
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
          <Filter className="h-4 w-4 inline mr-2" />
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
              <option value="1">Food & Beverage</option>
              <option value="2">Beauty & Cosmetics</option>
              <option value="3">Books & Reading</option>
              <option value="4">Health & Wellness</option>
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

          <div>
            <label htmlFor="frequency" className="block text-sm mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={filters.frequency}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            >
              <option value="">All Frequencies</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

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
  )
}
