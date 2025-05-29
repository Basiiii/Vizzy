'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import { OverviewPage } from './layout/overview-page';
import { ListingsPage } from './layout/listings-page';
import { ProposalsPage } from './layout/proposals-page';
import { Button } from '@/components/ui/common/button';
import { ListingDialog } from '@/components/listings/create-listing-dialog';
import {
  FilterDropdown,
  type FilterOption,
} from '@/components/ui/data-display/filter-dropdown';
import { useTranslations } from 'next-intl';
import { FavoritesPage } from './layout/favorites-page';

export default function DashboardPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('activeTab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const t = useTranslations('dashboard');
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    {
      id: 'received',
      label: t('proposals.filterOptions.received'),
      checked: false,
    },
    { id: 'sent', label: t('proposals.filterOptions.sent'), checked: false },
    {
      id: 'accepted',
      label: t('proposals.filterOptions.accepted'),
      checked: false,
    },
    {
      id: 'rejected',
      label: t('proposals.filterOptions.rejected'),
      checked: false,
    },
    {
      id: 'cancelled',
      label: t('proposals.filterOptions.cancelled'),
      checked: false,
    },
    {
      id: 'pending',
      label: t('proposals.filterOptions.pending'),
      checked: true,
    },
  ]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Update URL without full page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('activeTab', value);
    window.history.pushState({}, '', url);
  };

  const handleFilterChange = (updatedOptions: FilterOption[]) => {
    setFilterOptions(updatedOptions);
  };

  // Check if any filter is selected
  const hasActiveFilters = filterOptions.some((option) => option.checked);

  return (
    <div className="border-b">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        </div>
        <h1 className="py-0 text- dark:text-gray-400">{t('subtitle')}</h1>
        <Tabs
          value={activeTab}
          defaultValue="overview"
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview" className="cursor-pointer">
                {t('tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="listings" className="cursor-pointer">
                {t('tabs.listings')}
              </TabsTrigger>
              <TabsTrigger value="proposals" className="cursor-pointer">
                {t('tabs.proposals')}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="cursor-pointer">
                {t('tabs.favorites')}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'listings' && (
              <Button
                variant={'default'}
                onClick={() => setCreateListingOpen(true)}
              >
                {t('listings.button')}
              </Button>
            )}

            {activeTab === 'proposals' && (
              <FilterDropdown
                options={filterOptions}
                onChange={handleFilterChange}
                label={t('proposals.filters')}
                buttonText={t('proposals.filters')}
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
            <ProposalsPage
              filterOptions={filterOptions}
              hasActiveFilters={hasActiveFilters}
            ></ProposalsPage>
          </TabsContent>
          <TabsContent value="favorites" className="space-y-4">
            <FavoritesPage></FavoritesPage>
          </TabsContent>
        </Tabs>
      </div>

      <ListingDialog
        open={createListingOpen}
        onOpenChange={setCreateListingOpen}
      />
    </div>
  );
}
