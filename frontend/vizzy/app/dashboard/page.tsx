import { Metadata } from 'next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import { CalendarDateRangePicker } from '@/app/dashboard/components/date-range-picker';
import { OverviewPage } from './layout/overview-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard - Sales and Revenue Overview',
    description:
      'Explore your business performance with real-time insights. Track total revenue, recent sales, and sales growth trends. Gain valuable analytics on transactions, proposals, and advertisements.',
  };
}

export default function DashboardPage() {
  return (
    <div className="border-b">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="cursor-pointer">
              Visão geral
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
          <TabsContent value="overview" className="space-y-4">
            <OverviewPage></OverviewPage>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
