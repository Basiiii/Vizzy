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
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  receiver_id: string;
}

export function PurchaseProposalDialog({
  product,
  trigger,
  receiver_id,
}: PurchaseProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('proposalDialogs');
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
      proposal_type: 'sale',
      proposal_status: 'pending',
      offered_price: Number(formData.value),
      receiver_id: receiver_id,
    };

    try {
      await createProposal(proposal);
      toast.success(t('sale.proposalSentSuccess'), {
        description: t('sale.proposalSentSuccessDescription'),
        duration: 4000,
      });
      setOpen(false);
      setFormData({ value: '', message: '' });
    } catch (error) {
      console.error('Failed to create purchase proposal:', error);
      toast.error(t('sale.proposalSentError'), {
        description: t('sale.proposalSentErrorDescription'),
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
        {trigger || <Button>{t('sale.purchaseOffer')}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('sale.title')}</DialogTitle>
          <DialogDescription>{t('sale.description')}</DialogDescription>
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
                <Label htmlFor="value">{t('sale.price')}</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  placeholder={t('sale.pricePlaceholder')}
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                />
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
