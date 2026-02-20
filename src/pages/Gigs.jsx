import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import GigCard from "../components/gigs/GigCard";
import newRequest from "../utils/newRequest";

const categories = [
  "All", "Graphics & Design", "Digital Marketing", "Writing & Translation",
  "Video & Animation", "Music & Audio", "Programming & Tech", "Business", "Lifestyle",
];

export default function Gigs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("sales");
  const [filters, setFilters] = useState({ min: "", max: "" });

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    if (filters.min) params.set("min", filters.min);
    if (filters.max) params.set("max", filters.max);
    params.set("sort", sort);
    return params.toString();
  };

  const { data: gigs, isLoading, error, refetch } = useQuery({
    queryKey: ["gigs", category, search, sort, filters],
    queryFn: () => newRequest.get(`/gigs?${buildQuery()}`).then((res) => res.data),
  });

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    setSearchParams(params);
  };

  const handleApplyFilters = () => refetch();

  const handleClearFilters = () => {
    setFilters({ min: "", max: "" });
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      {/* Search bar */}
      {search && (
        <div className="bg-white border-b py-4">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-secondary">
              Results for: <span className="font-bold">"{search}"</span>
              {gigs && <span className="text-gray-400 ml-2">({gigs.length} services)</span>}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-secondary mb-4">Categories</h3>
              <ul className="space-y-1 mb-6">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        (cat === "All" && !category) || category === cat
                          ? "bg-primary text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <hr className="mb-4 border-gray-100" />

              <h3 className="font-bold text-secondary mb-4">Price Range</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.min}
                  onChange={(e) => setFilters({ ...filters, min: e.target.value })}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.max}
                  onChange={(e) => setFilters({ ...filters, max: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <button onClick={handleApplyFilters} className="btn-primary w-full text-sm py-2 mb-2">Apply</button>
              <button onClick={handleClearFilters} className="w-full text-sm text-gray-500 hover:text-secondary py-1">Clear Filters</button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary">
                {category || (search ? `"${search}"` : "All Services")}
              </h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field w-auto text-sm"
              >
                <option value="sales">Best Selling</option>
                <option value="createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg h-64 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-500">
                <p className="text-lg">Failed to load gigs. Please try again.</p>
              </div>
            )}

            {gigs && gigs.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-secondary mb-2">No gigs found</h3>
                <p className="text-gray-500">Try different keywords or filters</p>
              </div>
            )}

            {gigs && gigs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
