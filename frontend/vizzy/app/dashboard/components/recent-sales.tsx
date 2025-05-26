import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import { useEffect, useState } from 'react';
import { fetchUserFilteredProposals } from '@/lib/api/proposals/fetch-user-proposals';
import type { Proposal } from '@/types/proposal';
import { getUserAction } from '@/lib/utils/token/get-server-user-action';
import type { ProfileMetadata } from '@/types/profile';
import { CalendarIcon } from '@radix-ui/react-icons';
import { PROFILE_PICTURE_PATH } from '@/lib/constants/storage';
import { SUPABASE_STORAGE_URL } from '@/lib/constants/storage';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/data-display/card';
import { useTranslations } from 'next-intl';

export function RecentSales() {
  const t = useTranslations('proposals');
  const [sales, setSales] = useState<Proposal[]>([]);
  const [userMetadata, setUserMetadata] = useState<ProfileMetadata | null>(
    null,
  );
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    async function loadUser() {
      const user = await getUserAction();
      setUserMetadata(user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadSales() {
      const result = await fetchUserFilteredProposals({
        accepted: true,
        offset: 1,
        limit: 10,
      });
      if (result.data) {
        const salesOnly = result.data.proposals.filter(
          (proposal) => proposal.proposal_type === 'sale',
        );
        setSales(salesOnly);
        setTotalCount(salesOnly.length);
      }
    }
    loadSales();
  }, []);

  if (!userMetadata) {
    return null;
  }

  return (
    <>
      <CardHeader className="pl-0 pt-0 pb-2">
        <CardTitle className="text-xl">{t('recentSales.title')}</CardTitle>
        <CardDescription className="text-base mt-0.5">
          {t('recentSales.description', { count: totalCount })}
        </CardDescription>
      </CardHeader>
      <div className="h-[400px] overflow-y-auto pr-4 py-4">
        {sales.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {t('recentSales.noSales')}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {t('recentSales.noSalesDescription')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {sales.map((sale) => {
              const isSender = userMetadata.id === sale.sender_id;
              const displayName = isSender
                ? sale.receiver_name
                : sale.sender_name;
              const displayPrice = sale.offered_price
                ? (isSender ? -1 : 1) * sale.offered_price
                : 0;
              const formattedDate = new Date(
                sale.created_at,
              ).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <div className="flex items-center" key={sale.id}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${
                        isSender ? sale.receiver_id : sale.sender_id
                      }`}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {displayName
                        ? displayName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <p className="text-xs font-normal leading-none">
                          {formattedDate}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sale.listing_title}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto font-medium">
                    {displayPrice > 0 ? '+' : ''}
                    {displayPrice.toLocaleString('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
