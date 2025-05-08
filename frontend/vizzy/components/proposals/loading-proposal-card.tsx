import { Skeleton } from '../ui/data-display/skeleton';

export default function LoadingProposalCard() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
