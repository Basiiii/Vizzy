'use client';

import type React from 'react';
import { useState, useRef } from 'react';
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
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/common/label';
import { Textarea } from '@/components/ui/forms/textarea';
import type { DateRange } from 'react-day-picker';
import { CreateProposalDto } from '@/types/create-proposal';
import { createProposal } from '@/lib/api/proposals/create-proposal';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/data-display/calendar';
import { cn } from '@/lib/utils/shadcn-merge';
import { stripTimezone } from '@/lib/utils/dates';
import { useTranslations } from 'next-intl';

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
  value_per_day: string;
  message: string;
}

export function RentalProposalDialog({
  product,
  trigger,
  receiver_id,
}: RentalProposalDialogProps) {
  const t = useTranslations('proposals.rentalDialog');
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<RentalFormState>({
    value_per_day: '',
    message: '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    const dailyRate = Number.parseFloat(formData.value_per_day) || 0;

    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message,
      listing_id: Number(product.id),
      proposal_type: 'rental',
      proposal_status: 'pending',
      offered_rent_per_day: dailyRate,
      start_date: stripTimezone(dateRange.from),
      end_date: stripTimezone(dateRange.to),
      message: formData.message,
      receiver_id: receiver_id,
    };

    try {
      console.log('Creating rental proposal:', proposal);
      await createProposal(proposal);

      setOpen(false);
      setFormData({ value_per_day: '', message: '' });
      setDateRange({ from: proposal.start_date, to: proposal.end_date });
    } catch (error) {
      console.error('Failed to create rental proposal:', error);
      // We might want to show an error message to the user here
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
        {trigger || <Button>{t('makeProposal')}</Button>}
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
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
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
                    {product.price}€ · {product.condition}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value_per_day">{t('dailyRate')}</Label>
                <Input
                  id="value_per_day"
                  name="value_per_day"
                  type="number"
                  step="0.01"
                  placeholder={t('dailyRatePlaceholder')}
                  value={formData.value_per_day}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rentalPeriod">{t('rentalPeriod')}</Label>
                <Button
                  type="button"
                  id="rentalPeriod"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
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
                    <span>{t('selectRentalPeriod')}</span>
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
                        className="h-8 w-8 p-0"
                        onClick={() => setCalendarOpen(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={window?.innerWidth < 768 ? 1 : 2}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">{t('message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t('messagePlaceholder')}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {dateRange?.from && dateRange?.to && formData.value_per_day && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('totalValue')}</span>
                    <span className="text-lg font-semibold text-green-600">
                      {Math.ceil(
                        (dateRange.to.getTime() - dateRange.from.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) * Number(formData.value_per_day)}
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
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!dateRange?.from || !dateRange?.to}
              >
                {t('submitProposal')}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
