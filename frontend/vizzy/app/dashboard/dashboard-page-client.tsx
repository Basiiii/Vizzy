"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
import { CalendarDateRangePicker } from "@/components/ui/data-display/date-range-picker"
import { OverviewPage } from "./layout/overview-page"
import { ListingsPage } from "./layout/listings-page"
import { ProposalsPage } from "./layout/proposals-page"
import { Button } from "@/components/ui/common/button"
import { ListingDialog } from "@/components/listings/create-listing-dialog"
import { FilterDropdown, type FilterOption } from "@/components/ui/data-display/filter-dropdown"

export default function DashboardPageClient() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("activeTab")
  const [activeTab, setActiveTab] = useState(tabParam || "overview")
  const [createListingOpen, setCreateListingOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    { id: "received", label: "Received", checked: false },
    { id: "sent", label: "Sent", checked: false },
    { id: "accepted", label: "Accepted", checked: false },
    { id: "rejected", label: "Rejected", checked: false },
    { id: "canceled", label: "Cancelled", checked: false },
    { id: "pending", label: "Pending", checked: true },
  ])
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL without full page refresh
    const url = new URL(window.location.href)
    url.searchParams.set("activeTab", value)
    window.history.pushState({}, "", url)
  }

  const handleFilterChange = (updatedOptions: FilterOption[]) => {
    setFilterOptions(updatedOptions)
  }

  // Check if any filter is selected
  const hasActiveFilters = filterOptions.some((option) => option.checked)

  return (
    <div className="border-b">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Painel de Controlo</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
          </div>
        </div>
        <Tabs value={activeTab} defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview" className="cursor-pointer">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="listings" className="cursor-pointer">
                Anúncios
              </TabsTrigger>
              <TabsTrigger value="proposals" className="cursor-pointer">
                Propostas
              </TabsTrigger>
            </TabsList>

            {activeTab === "listings" && (
              <Button variant={"default"} onClick={() => setCreateListingOpen(true)}>
                Novo Anúncio
              </Button>
            )}

            {activeTab === "proposals" && (
              <FilterDropdown
                options={filterOptions}
                onChange={handleFilterChange}
                label="Filter proposals"
                buttonText="Filter proposals"
                showActiveBadges={false}
                isOpen={filterDropdownOpen}
                onOpenChange={setFilterDropdownOpen}
              />
            )}
          </div>
          <TabsContent value="overview" className="space-y-4">
            <OverviewPage></OverviewPage>
          </TabsContent>
          <TabsContent value="listings" className="space-y-4">
            <ListingsPage></ListingsPage>
          </TabsContent>
          <TabsContent value="proposals" className="space-y-4">
            <ProposalsPage filterOptions={filterOptions} hasActiveFilters={hasActiveFilters}></ProposalsPage>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            {/* Transactions content will go here */}
          </TabsContent>
        </Tabs>
      </div>

      <ListingDialog open={createListingOpen} onOpenChange={setCreateListingOpen} />
    </div>
  )
}
