'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Overview } from '@/app/dashboard/components/overview';
import { RecentSales } from '@/app/dashboard/components/recent-sales';
import { UserBalance } from '@/app/dashboard/components/user-balance';

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <div className="w-full">
        <UserBalance />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
