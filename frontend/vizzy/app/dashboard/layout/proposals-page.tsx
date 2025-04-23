"use client"

import { useState, useEffect } from "react"
import ProposalCard from "@/components/proposals/proposal-card"
import type { Proposal } from "@/types/proposal"
import { Skeleton } from "@/components/ui/data-display/skeleton"
import { fetchUserFilteredProposals } from "@/lib/api/proposals/fetch-user-proposals"
import type { FilterOption } from "@/components/ui/data-display/filter-dropdown"
import { PaginationControls } from "@/components/marketplace/pagination-controls"

interface ProposalsPageProps {
  filterOptions?: FilterOption[]
  hasActiveFilters: boolean
}

export function ProposalsPage({ filterOptions = [], hasActiveFilters }: ProposalsPageProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    setCurrentPage(1)
  }, [filterOptions, hasActiveFilters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true)
        setError(null)

        type FilterKeys = 'received' | 'sent' | 'accepted' | 'rejected' | 'canceled' | 'pending';
        
        const activeFilters = filterOptions.reduce<Record<FilterKeys, boolean>>(
          (acc, filter) => {
            acc[filter.id as FilterKeys] = filter.checked;
            return acc
          },
          {
            received: false,
            sent: false,
            accepted: false,
            rejected: false,
            canceled: false,
            pending: false,
          }
        )

        const data = await fetchUserFilteredProposals({
          ...activeFilters,
          offset: currentPage,
          limit: itemsPerPage
        })

        if (data) {
          setProposals(data.data?.proposals || [])
          const total = typeof data.data?.totalProposals === 'number' ? data.data?.totalProposals : data.data?.proposals?.length || 0
          setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)))
        } else {
          setProposals([])
          setTotalPages(1)
        }
      } catch (error) {
        console.error("Error loading proposals:", error)
        setError("Failed to load proposals")
        setProposals([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    loadProposals()
  }, [filterOptions, hasActiveFilters, currentPage])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button className="mt-2 text-red-700 underline" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (proposals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">Você não tem propostas</h3>
          <p className="text-muted-foreground mt-1">Quando você receber propostas, elas aparecerão aqui</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
