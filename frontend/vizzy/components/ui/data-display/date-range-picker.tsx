'use client';

import * as React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils/shadcn-merge';
import { Button } from '@/components/ui/common/button';
import { Calendar } from '@/components/ui/data-display/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/overlay/popover';

export function CalendarDateRangePicker({
  className,
  startDays = -14,  // default to 14 days before
  endDays = 0,      // default to today
}: React.HTMLAttributes<HTMLDivElement> & {
  startDays?: number;
  endDays?: number;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), startDays),
    to: addDays(new Date(), endDays),
  });

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" onInteractOutside={(e) => e.preventDefault()}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
