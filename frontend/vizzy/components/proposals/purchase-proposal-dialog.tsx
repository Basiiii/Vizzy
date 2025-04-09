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
import { CreateProposalDto } from '@/types/create-proposal';
import { createProposal } from '@/lib/api/proposals/create-proposal';
interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface PurchaseFormState {
  value: string;
  message: string;
}

interface PurchaseProposalDialogProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
}

export function PurchaseProposalDialog({
  product,
  trigger,
}: PurchaseProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PurchaseFormState>({
    value: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message,
      listing_id: Number(product.id),
      proposal_type: 'purchase',
      proposal_status: 'pending',
      offered_price: Number(formData.value),
      message: formData.message,
    };

    try {
      // Call the API to create the proposal
      await createProposal(proposal);
      
      
      // Reset the form
      setOpen(false);
      setFormData({ value: '', message: '' });
    } catch (error) {
      console.error('Failed to create purchase proposal:', error);
      // You might want to show an error message to the user here
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
            Make an offer to purchase this item
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
                    ${product.price.toFixed(2)} · {product.condition}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Offer Price</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  placeholder="Enter your offer"
                  value={formData.value}
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
              <Button type="submit">Submit Proposal</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
