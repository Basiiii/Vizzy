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
import { Label } from '@/components/ui/common/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { CreateProposalDto } from '@/types/create-proposal';
import { createProposal } from '@/lib/api/proposals/create-proposal';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface PurchaseFormState {
  message: string;
}

interface BuyNowProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
  receiver_id: string;
}

export function BuyNowDialog({ product, trigger, receiver_id }: BuyNowProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PurchaseFormState>({
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message,
      listing_id: Number(product.id),
      proposal_type: 'sale',
      proposal_status: 'pending',
      offered_price: product.price,
      receiver_id: receiver_id,
    };

    try {
      await createProposal(proposal);
      toast.success('Proposal sent!', {
        description: 'Your purchase proposal has been sent to the seller.',
        duration: 4000,
      });
      setOpen(false);
      setFormData({ message: '' });
    } catch (error) {
      console.error('Failed to create purchase proposal:', error);
      toast.error('Failed to send proposal', {
        description:
          'There was an error sending your proposal. Please try again.',
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
        {trigger || <Button>Make Purchase Proposal</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase Proposal</DialogTitle>
          <DialogDescription>
            Are you sure you want to buy this item?
          </DialogDescription>
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
              <Button type="submit">Buy now</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
