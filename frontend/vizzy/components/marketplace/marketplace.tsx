"use client"

import { useListings } from "@/hooks/use-listings"
import { SearchBar } from "./search-bar"
import { FiltersSection } from "./filters-section"
import { ListingsGrid } from "./listings-grid"
import { PaginationControls } from "./pagination-controls"

export default function Marketplace() {
  const {
    listings,
    loading,
    page,
    totalPages,
    listingType,
    searchInput,
    setSearchInput,
    userLocation,
    useLocation,
    locationDistance,
    handlePageChange,
    handleSearch,
    handleTypeChange,
    handleLocationToggle,
    handleDistanceChange,
  } = useListings()

  return (
    <div className="container mx-auto xl:px-14 px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-6">Find what you need</h1>

        <div className="space-y-4">
          {/* Search Bar */}
          <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} handleSearch={handleSearch} />

          {/* Filters Section */}
          <FiltersSection
            listingType={listingType}
            handleTypeChange={handleTypeChange}
            userLocation={userLocation}
            useLocation={useLocation}
            handleLocationToggle={handleLocationToggle}
            locationDistance={locationDistance}
            handleDistanceChange={handleDistanceChange}
          />
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Listings</h2>
        </div>

        <ListingsGrid listings={listings} loading={loading} />

        {/* Pagination */}
        <PaginationControls page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
      </section>
    </div>
  )
}
