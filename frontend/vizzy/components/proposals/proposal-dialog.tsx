'use client';

import type React from 'react';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Calendar } from '@/components/ui/data-display/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/overlay/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/shadcn-merge';

type ProposalType = 'purchase' | 'rental' | 'exchange';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface ProposalDialogProps {
  product: Product;
  proposalType: ProposalType;
  onSubmit: (data: any) => void;
  trigger?: React.ReactNode;
}

export function ProposalDialog({
  product,
  proposalType,
  onSubmit,
  trigger,
}: ProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };

    if (proposalType === 'rental' && date) {
      data.rentalDate = date;
    }

    onSubmit(data);
    setOpen(false);
    setFormData({});
    setSelectedImage(null);
    setDate(undefined);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setFormData({
          ...formData,
          image: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Make a Proposal</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {proposalType === 'purchase' && 'Purchase Proposal'}
            {proposalType === 'rental' && 'Rental Proposal'}
            {proposalType === 'exchange' && 'Exchange Proposal'}
          </DialogTitle>
          <DialogDescription>
            {proposalType === 'purchase' &&
              'Make an offer to purchase this item'}
            {proposalType === 'rental' && 'Make an offer to rent this item'}
            {proposalType === 'exchange' && 'Propose an item to exchange'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-md">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.title}
                    className="h-full w-full object-cover"
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
            {proposalType === 'purchase' && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="offerPrice">Offer Price</Label>
                  <Input
                    id="offerPrice"
                    name="offerPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter your offer"
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Add a message to your proposal"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {proposalType === 'rental' && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="offerPrice">Offer Price</Label>
                  <Input
                    id="offerPrice"
                    name="offerPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter your offer"
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rentalDate">Rental Period</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
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
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {proposalType === 'exchange' && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the item you want to exchange"
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange(value, 'condition')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image Upload (JPG/PNG, max 1MB)</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleImageUpload}
                    required
                  />

                  {selectedImage && (
                    <div className="relative mt-2 h-40 w-full overflow-hidden rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10 h-6 w-6 rounded-full bg-background/80"
                        onClick={() => {
                          setSelectedImage(null);
                          setFormData({
                            ...formData,
                            image: undefined,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <img
                        src={selectedImage || '/placeholder.svg'}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Proposal</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
