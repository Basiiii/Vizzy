'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/overlay/dialog';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Label } from '@/components/ui/common/label';
import { Textarea } from '@/components/ui/forms/textarea';
import type { DateRange } from 'react-day-picker';
import { CreateProposalDto } from '@/types/create-proposal';
import { createProposal } from '@/lib/api/proposals/create-proposal';
import { CalendarIcon } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { Calendar } from '@/components/ui/data-display/calendar';
import { cn } from '@/lib/utils/shadcn-merge';
import { stripTimezone } from '@/lib/utils/dates';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  getRentalAvailability,
  type RentalAvailability,
} from '@/lib/api/listings/get-rental-availability';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface RentalProposalDialogProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
  receiver_id: string;
}

interface RentalFormState {
  message: string;
}

export function RentNowDialog({
  product,
  trigger,
  receiver_id,
}: RentalProposalDialogProps) {
  const t = useTranslations('proposalDialogs');
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<RentalFormState>({
    message: '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [unavailableDates, setUnavailableDates] = useState<
    RentalAvailability[]
  >([]);

  useEffect(() => {
    if (open) {
      // Fetch rental availability when dialog opens
      getRentalAvailability(Number(product.id))
        .then((availability) => {
          setUnavailableDates(availability);
        })
        .catch((error) => {
          console.error('Failed to fetch rental availability:', error);
          toast.error('Failed to load rental availability', {
            description: 'Some dates may be unavailable',
            duration: 4000,
          });
        });
    }
  }, [open, product.id]);

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some((period) => {
      const start = new Date(period.start_date);
      const end = new Date(period.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  const hasUnavailableDatesInRange = (from: Date, to: Date) => {
    const currentDate = new Date(from);
    while (currentDate <= to) {
      if (isDateUnavailable(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDateRange(range);
      return;
    }

    if (!range.to) {
      // If we're just selecting the start date, allow it
      setDateRange(range);
      return;
    }

    // If we have both from and to dates, check if there are any unavailable dates in between
    if (hasUnavailableDatesInRange(range.from, range.to)) {
      toast.error(t('rental.unavailableDatesInRange'), {
        description: t('rental.unavailableDatesInRangeDescription'),
        duration: 4000,
      });
      // Reset to just the from date
      setDateRange({ from: range.from, to: undefined });
      return;
    }

    setDateRange(range);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message,
      listing_id: Number(product.id),
      proposal_type: 'rental',
      proposal_status: 'pending',
      offered_rent_per_day: product.price,
      start_date: stripTimezone(dateRange.from),
      end_date: stripTimezone(dateRange.to),
      message: formData.message,
      receiver_id: receiver_id,
    };

    try {
      console.log('Creating rental proposal:', proposal);
      await createProposal(proposal);
      toast.success(t('proposalSentSuccess'), {
        description: t('proposalSentSuccessDescription'),
        duration: 4000,
      });
      setOpen(false);
      setFormData({ message: '' });
      setDateRange({ from: proposal.start_date, to: proposal.end_date });
    } catch (error) {
      console.error('Failed to create rental proposal:', error);
      toast.error(t('proposalSentError'), {
        description: t('proposalSentErrorDescription'),
        duration: 4000,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t('rental.makeProposal')}</Button>}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => {
          if (calendarOpen) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (calendarOpen) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('rental.title')}</DialogTitle>
          <DialogDescription>{t('rental.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-md">
                  <Image
                    src={product.image || '/placeholder.svg?height=80&width=80'}
                    alt={product.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.price}€ ·{' '}
                    {t(`common.condition.${product.condition}`)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rentalPeriod">{t('rental.rentalPeriod')}</Label>
                <Button
                  type="button"
                  id="rentalPeriod"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal cursor-pointer',
                    !dateRange?.from && 'text-muted-foreground',
                  )}
                  onClick={() => setCalendarOpen(!calendarOpen)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>{t('rental.selectRentalPeriod')}</span>
                  )}
                </Button>

                {calendarOpen && (
                  <div
                    ref={calendarRef}
                    className="fixed z-50 bg-background border rounded-md shadow-md p-3"
                    style={{
                      zIndex: 9999,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      maxHeight: '90vh',
                      maxWidth: '90vw',
                      overflow: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => setCalendarOpen(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateSelect}
                        numberOfMonths={window?.innerWidth < 768 ? 1 : 2}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today || isDateUnavailable(date);
                        }}
                        modifiers={{
                          unavailable: (date) => isDateUnavailable(date),
                        }}
                        modifiersStyles={{
                          unavailable: {
                            color: 'var(--destructive)',
                            textDecoration: 'line-through',
                          },
                        }}
                        initialFocus
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">{t('common.message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t('common.messagePlaceholder')}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {dateRange?.from && dateRange?.to && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {t('rental.totalValue')}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {Math.ceil(
                        (dateRange.to.getTime() - dateRange.from.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) * product.price}
                      €
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!dateRange?.from || !dateRange?.to}
                className="cursor-pointer"
              >
                {t('common.submit')}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
