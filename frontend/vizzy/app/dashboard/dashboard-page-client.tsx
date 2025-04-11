'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { CalendarDateRangePicker } from '@/app/dashboard/components/date-range-picker';
import { OverviewPage } from './layout/overview-page';
import { ListingsPage } from './layout/listings-page';
import { ProposalsPage } from './layout/proposals-page';
import { Button } from '@/components/ui/common/button';
//import Link from 'next/link';
import { ListingDialog } from '@/components/ui/overlay/create-listing-dialog';

export default function DashboardPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('activeTab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [viewType, setViewType] = useState<'received' | 'sent' | 'accepted'|'rejected'>('received');
  const [createListingOpen, setCreateListingOpen] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Update URL without full page refresh
    // TODO: Melhorar desempenho
    const url = new URL(window.location.href);
    url.searchParams.set('activeTab', value);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="border-b">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Painel de Controlo
          </h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
          </div>
        </div>
        <Tabs
          value={activeTab}
          defaultValue="overview"
          className="space-y-4"
          onValueChange={handleTabChange}
        >
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
              <TabsTrigger value="transactions" className="cursor-pointer">
                Transações
              </TabsTrigger>
            </TabsList>

            {activeTab === 'listings' && (
              <Button 
                variant={'default'} 
                onClick={() => setCreateListingOpen(true)}
              >
                Novo Anúncio
              </Button>
            )}
            {activeTab === 'proposals' && (
              <div className="flex gap-2">
                <Select
                  value={viewType}
                  onValueChange={(value: 'received' | 'sent' |'accepted'|'rejected') =>
                    setViewType(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received Proposals</SelectItem>
                    <SelectItem value="sent">Sent Proposals</SelectItem>
                    <SelectItem value="accepted">Accepted Proposals</SelectItem>
                    <SelectItem value="rejected">Rejected Proposals</SelectItem>
                    {/* <SelectItem value="canceled">Canceled Proposals</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <TabsContent value="overview" className="space-y-4">
            <OverviewPage></OverviewPage>
          </TabsContent>
          <TabsContent value="listings" className="space-y-4">
            <ListingsPage></ListingsPage>
          </TabsContent>
          <TabsContent value="proposals" className="space-y-4">
            <ProposalsPage viewType={viewType}></ProposalsPage>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            {/* Transactions content will go here */}
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
