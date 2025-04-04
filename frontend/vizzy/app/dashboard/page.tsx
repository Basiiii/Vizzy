import type { Metadata } from 'next';
import DashboardPageClient from './dashboard-page-client';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard - Sales and Revenue Overview',
    description:
      'Explore your business performance with real-time insights. Track total revenue, recent sales, and sales growth trends. Gain valuable analytics on transactions, proposals, and advertisements.',
  };
}

export default function DashboardPage() {
  return <DashboardPageClient />;
}
