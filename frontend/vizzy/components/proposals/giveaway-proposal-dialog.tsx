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

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
  owner_id: string;
}

interface GiveawayProposalDialogProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
  receiver_id?: string;
  sender_id?: string;
}

export function GiveawayProposalDialog({
  product,
  trigger,
  receiver_id,
  sender_id,
}: GiveawayProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const proposal: CreateProposalDto = {
      title: product.title,
      description: message,
      listing_id: Number(product.id),
      proposal_type: 'giveaway',
      proposal_status: 'pending',
      message: message,
    };

    try {
      // Handle counter proposal scenario
      if (receiver_id && sender_id) {
        // If this is a counter proposal, swap the sender and receiver
        proposal.sender_id = receiver_id; // Current user (receiver of original proposal)
        proposal.receiver_id = sender_id; // Original sender becomes the target
      } else {
        // Normal proposal to listing owner
        proposal.receiver_id = product.owner_id;
      }

      await createProposal(proposal);

      // Reset form and close dialog
      setOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Failed to create giveaway proposal:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Request Item</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Giveaway Item</DialogTitle>
          <DialogDescription>
            Send a message to request this item
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
                    Giveaway · {product.condition}
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
                  placeholder="Explain why you would like this item"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
