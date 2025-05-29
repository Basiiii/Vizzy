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
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface GiveawayProposalDialogProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
  receiver_id: string;
}

export function GiveawayProposalDialog({
  product,
  trigger,
  receiver_id,
}: GiveawayProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const t = useTranslations('proposalDialogs');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const proposal: CreateProposalDto = {
      title: product.title,
      description: message,
      listing_id: Number(product.id),
      proposal_type: 'giveaway',
      proposal_status: 'pending',
      message: message,
      receiver_id: receiver_id,
    };

    try {
      await createProposal(proposal);
      toast.success(t('giveaway.proposalSentSuccess'), {
        description: t('giveaway.proposalSentSuccessDescription'),
        duration: 4000,
      });
      setOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Failed to create giveaway proposal:', error);
      toast.error(t('giveaway.proposalSentError'), {
        description: t('giveaway.proposalSentErrorDescription'),
        duration: 4000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t('giveaway.requestItem')}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('giveaway.title')}</DialogTitle>
          <DialogDescription>{t('giveaway.description')}</DialogDescription>
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
                    {t('giveaway.type')} ·{' '}
                    {t(`common.condition.${product.condition}`)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="message">{t('common.message')}</Label>
                <Textarea
                  id="message"
                  placeholder={t('common.messagePlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.submit')}</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
