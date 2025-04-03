'use client';

import type React from 'react';
import { useState } from 'react';
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
import { Calendar } from '@/components/ui/data-display/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/overlay/popover';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils/shadcn-merge';
import type { DateRange } from 'react-day-picker';
import { Proposal } from '@/types/proposal';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface RentalProposalDialogProps {
  product: Product;
  onSubmit: (data: Proposal) => void;
  trigger?: React.ReactNode;
}

interface RentalFormState {
  value_per_day: string;
  message: string;
}

export function RentalProposalDialog({
  product,
  onSubmit,
  trigger,
}: RentalProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RentalFormState>({
    value_per_day: '',
    message: '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    // Calculate total value based on daily rate and number of days
    const daysCount = differenceInDays(dateRange.to, dateRange.from) + 1;
    const dailyRate = Number.parseFloat(formData.value_per_day) || 0;

    // Create a proposal object from the form data
    const proposal: Proposal = {
      listing_id: product.id,
      user_id: '', // This would typically come from auth context
      message: `${formData.message}\n\nRental period: ${format(
        dateRange.from,
        'PP',
      )} to ${format(dateRange.to, 'PP')}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      proposal_type: 'rental',
      value: dailyRate * daysCount, // Total value for the entire rental period
      value_per_day: dailyRate,
    };

    onSubmit(proposal);
    setOpen(false);
    setFormData({ value_per_day: '', message: '' });
    setDateRange({ from: undefined, to: undefined });
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
        {trigger || <Button>Make Rental Proposal</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rental Proposal</DialogTitle>
          <DialogDescription>Make an offer to rent this item</DialogDescription>
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
                    ${product.price.toFixed(2)} · {product.condition}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value_per_day">Daily Rate</Label>
                <Input
                  id="value_per_day"
                  name="value_per_day"
                  type="number"
                  step="0.01"
                  placeholder="Enter your daily rate offer"
                  value={formData.value_per_day}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rentalPeriod">Rental Period</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="rentalPeriod"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange?.from && 'text-muted-foreground',
                      )}
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
                        'Select date range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Add a message to your proposal"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!dateRange?.from || !dateRange?.to}
              >
                Submit Proposal
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
