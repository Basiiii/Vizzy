import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
// import Link from 'next/link';

export default function Loading() {
  return (
    <main className="container mx-auto py-20 max-w-10/12">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center md:flex-row md:items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-24 md:ml-auto" />
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 w-24 mt-2" />
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 w-24 mt-2" />
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24 mt-2" />
        </Card>
      </div>

      {/* TODO: Show skeleton for listings or no? */}
      {/* Listings Section */}
      {/* <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Link
            href={''}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
          >
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </Card>
          ))}
        </div>
      </section> */}
    </main>
  );
}
