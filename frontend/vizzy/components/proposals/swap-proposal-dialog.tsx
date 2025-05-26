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
import { uploadProposalImages } from '@/lib/api/proposals/upload-proposal-images';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
}

interface ExchangeProposalDialogProps {
  product: Product;
  onSubmit?: (data: CreateProposalDto) => void;
  trigger?: React.ReactNode;
  receiver_id: string;
}

interface ExchangeFormState {
  swap_with: string;
  condition: string;
  message: string;
}

interface ImageFile {
  id: string;
  dataUrl: string;
  file: File;
}

export function ExchangeProposalDialog({
  product,
  trigger,
  receiver_id,
}: ExchangeProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExchangeFormState>({
    swap_with: '',
    condition: '',
    message: '',
  });
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast.error('Missing images', {
        description:
          'Please upload at least one image of the item you want to swap.',
        duration: 4000,
      });
      return;
    }

    const proposal: CreateProposalDto = {
      title: product.title,
      description: formData.message || 'No additional message provided',
      listing_id: Number(product.id),
      proposal_type: 'swap',
      proposal_status: 'pending',
      swap_with: formData.swap_with,
      receiver_id: receiver_id,
    };

    try {
      const createdProposal = await createProposal(proposal);
      console.log('Proposal created:', createdProposal);

      if (selectedImages.length > 0) {
        try {
          const imageFiles = selectedImages.map((img) => img.file);
          const proposalId = createdProposal.data?.id;
          await uploadProposalImages(proposalId!, imageFiles);
        } catch (imageError) {
          console.error('Failed to upload proposal images:', imageError);
          toast.error('Images upload failed', {
            description:
              'Proposal created but failed to upload images. Please try again or contact support.',
            duration: 4000,
          });
        }
      }

      toast.success('Proposal sent!', {
        description: 'Your swap proposal has been sent to the owner.',
        duration: 4000,
      });
      resetForm();
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to send proposal', {
        description:
          'There was an error sending your swap proposal. Please try again.',
        duration: 4000,
      });
    }
  };

  const resetForm = () => {
    setOpen(false);
    setFormData({ swap_with: '', condition: '', message: '' });
    setSelectedImages([]);
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 1MB.`);
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert(
          `File ${file.name} is not a supported format. Only JPG and PNG are allowed.`,
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newImage: ImageFile = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          dataUrl: reader.result as string,
          file: file,
        };

        setSelectedImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
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
                    {product.price}€ · {product.condition}
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
                  required
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
                <Label htmlFor="image">Images (JPG/PNG, max 1MB each)</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleImageUpload}
                  multiple
                  required={selectedImages.length === 0}
                />

                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-40 overflow-hidden rounded-md"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 z-10 h-6 w-6 rounded-full bg-background/80"
                          onClick={() => removeImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Image
                          src={img.dataUrl}
                          alt="Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          priority
                        />
                      </div>
                    ))}
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
              <Button type="submit" disabled={selectedImages.length === 0}>
                Submit Proposal
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
