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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { X } from 'lucide-react';
import { CreateProposalDto } from '@/types/create-proposal';
import { createProposal } from '@/lib/api/proposals/create-proposal';
interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface ExchangeProposalDialogProps {
  product: Product;
  onSubmit: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
}

interface ExchangeFormState {
  swap_with: string;
  condition: string;
  message: string;
}

export function ExchangeProposalDialog({
  product,
  trigger,
}: ExchangeProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExchangeFormState>({
    swap_with: '',
    condition: '',
    message: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      return;
    }

    // Create a proposal object from the form data
    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message || 'No additional message provided',
      listing_id: Number(product.id),
      proposal_type: 'swap',
      proposal_status: 'pending',
      swap_with: formData.swap_with,
    };

    try {
      // Call the API to create the proposal
      await createProposal(proposal);
      

      // Reset the form
      setOpen(false);
      setFormData({ swap_with: '', condition: '', message: '' });
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to create proposal:', error);
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

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      condition: value,
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
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Make Exchange Proposal</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exchange Proposal</DialogTitle>
          <DialogDescription>Propose an item to exchange</DialogDescription>
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
                <Label htmlFor="swap_with">Description</Label>
                <Textarea
                  id="swap_with"
                  name="swap_with"
                  placeholder="Describe the item you want to exchange"
                  value={formData.swap_with}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.condition}
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
              <div className="grid gap-2">
                <Label htmlFor="message">Additional Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Add any additional details"
                  value={formData.message}
                  onChange={handleInputChange}
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
              <Button type="submit" disabled={!selectedImage}>
                Submit Proposal
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
