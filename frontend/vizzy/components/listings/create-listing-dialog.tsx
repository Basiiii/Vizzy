'use client';

import type * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { ImagePlusIcon, Loader2, CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { listingSchema } from '@/lib/schemas/listing-schema';
import { Calendar } from '@/components/ui/data-display/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/shadcn-merge';
import { createListing } from '@/lib/api/listings/create-listing';
import { uploadListingImages } from '@/lib/api/listings/upload-listing-images';
import { updateListingImageUrl } from '@/lib/api/listings/update-listing-images-url';
import { stripTimezone } from '@/lib/utils/dates';
import { getProductCategories } from '@/lib/api/listings/get-product-categories';

type ListingType = 'sale' | 'swap' | 'rental' | 'giveaway';

interface ListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListingCreated?: () => void;
}

export function ListingDialog({
  open: controlledOpen,
  onOpenChange,
  onListingCreated,
}: ListingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]); // State holds simple strings now
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        const categoryNames = await getProductCategories();
        setCategories(categoryNames);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategoryError('Failed to load categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  const getDefaultValues = (type: ListingType) => {
    const baseValues = {
      title: '',
      description: '',
      category: '',
    };

    switch (type) {
      case 'sale':
        return {
          ...baseValues,
          listingType: 'sale' as const,
          price: 0,
          productCondition: 'New' as const,
          negotiable: false,
        };
      case 'rental':
        return {
          ...baseValues,
          listingType: 'rental' as const,
          costPerDay: 0,
          depositRequired: false,
          depositAmount: undefined,
          enableRentalDurationLimit: false,
          rentalDurationLimit: undefined,
          enableLateFee: false,
          lateFee: undefined,
          enableAutoClose: false,
          autoCloseDate: undefined,
        };
      case 'giveaway':
        return {
          ...baseValues,
          listingType: 'giveaway' as const,
          recipientRequirements: '',
        };
      case 'swap':
        return {
          ...baseValues,
          listingType: 'swap' as const,
          swapInterest: '',
        };
    }
  };

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: getDefaultValues('sale'),
  });

  const listingType = form.watch('listingType') as ListingType;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      // Create preview URLs for the images
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'listingType') {
        const newType = value.listingType as ListingType;
        form.reset(getDefaultValues(newType));
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setCalendarOpen(false);
      }
    }

    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calendarOpen]);

  async function onSubmit(values: z.infer<typeof listingSchema>) {
    setIsSubmitting(true);

    let listingId: number | null = null;

    try {
      // Base data common to all listing types
      const baseData = {
        title: values.title,
        description: values.description,
        category: values.category,
        listing_type: values.listingType,
      };

      const listingData = (() => {
        switch (values.listingType) {
          case 'sale':
            return {
              ...baseData,
              price: values.price,
              product_condition: values.productCondition,
              is_negotiable: values.negotiable,
            };
          case 'rental':
            return {
              ...baseData,
              cost_per_day: values.costPerDay,
              deposit_required: values.depositRequired,
              deposit_value: values.depositRequired
                ? values.depositValue
                : null,
              rental_duration_limit: values.enableRentalDurationLimit
                ? values.rentalDurationLimit
                : null,
              late_fee: values.enableLateFee ? values.lateFee : null,
              auto_close_date:
                values.enableAutoClose && values.autoCloseDate
                  ? stripTimezone(new Date(values.autoCloseDate))
                  : null,
            };
          case 'giveaway':
            return {
              ...baseData,
              recipient_requirements: values.recipientRequirements,
            };
          case 'swap':
            return {
              ...baseData,
              desired_item: values.swapInterest || '',
            };
          default:
            console.error('Unexpected listing type encountered in switch.');
            throw new Error(`Internal error: Unhandled listing type.`);
        }
      })();

      listingId = await createListing(listingData);
      console.log('Listing created with ID:', listingId);

      let firstImageUrl: string | null = null;
      if (images.length > 0) {
        firstImageUrl = await uploadListingImages(listingId, images); // Capture the returned URL
        console.log(
          'Images uploaded successfully. First image URL:',
          firstImageUrl,
        );
      }

      // If an image was uploaded and a URL was returned, update the listing
      if (firstImageUrl) {
        await updateListingImageUrl(listingId, firstImageUrl);
        console.log('Listing main image URL updated successfully.');
      }

      setOpen(false);

      form.reset(getDefaultValues('sale'));
      setImages([]);
      setPreviewUrls([]);

      onListingCreated?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent dialog from closing when calendar is open
        if (calendarOpen && !newOpen) {
          return;
        }
        setOpen(newOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto"
        // Add handlers to prevent dialog from closing when interacting with calendar
        onPointerDownOutside={(e) => {
          if (calendarOpen) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (calendarOpen) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Listing</DialogTitle>
          <DialogDescription>
            Fill out the details for your new listing.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value="sale"
                            className="hover:bg-muted/50"
                          >
                            Sale
                          </SelectItem>
                          <SelectItem
                            value="swap"
                            className="hover:bg-muted/50"
                          >
                            Swap
                          </SelectItem>
                          <SelectItem
                            value="rental"
                            className="hover:bg-muted/50"
                          >
                            Rental
                          </SelectItem>
                          <SelectItem
                            value="giveaway"
                            className="hover:bg-muted/50"
                          >
                            Giveaway
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCategories || !!categoryError} // Disable if loading or error
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : categoryError ? (
                          <SelectItem value="error" disabled>
                            Error loading categories
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="hover:bg-muted/50"
                            >
                              {category}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {categoryError && !isLoadingCategories && (
                      <p className="text-sm font-medium text-destructive">
                        {categoryError}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormLabel>Images</FormLabel>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        document.getElementById('image-upload')?.click()
                      }
                    >
                      <ImagePlusIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click here to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 1MB
                      </p>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="border rounded-lg p-2 h-full">
                      <p className="text-sm text-muted-foreground mb-2">
                        Current images
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {previewUrls.length > 0 ? (
                          previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={url || '/placeholder.svg'}
                                alt={`Preview ${index}`}
                                width={80}
                                height={80}
                                className="h-20 w-full object-cover rounded-md"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground col-span-2">
                            No images uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {listingType === 'sale' && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-medium">Sale Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value="New"
                              className="hover:bg-muted/50"
                            >
                              New
                            </SelectItem>
                            <SelectItem
                              value="Like New"
                              className="hover:bg-muted/50"
                            >
                              Like New
                            </SelectItem>
                            <SelectItem
                              value="Good"
                              className="hover:bg-muted/50"
                            >
                              Good
                            </SelectItem>
                            <SelectItem
                              value="Fair"
                              className="hover:bg-muted/50"
                            >
                              Fair
                            </SelectItem>
                            <SelectItem
                              value="Poor"
                              className="hover:bg-muted/50"
                            >
                              Poor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="negotiable"
                    render={({ field }) => (
                      <FormItem className="rounded-md border overflow-hidden">
                        <div className="flex flex-row items-center space-x-2 p-3 bg-background">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Negotiable
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Allow buyers to negotiate the price
                            </FormDescription>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {listingType === 'rental' && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-medium">Rental Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="depositRequired"
                    render={({ field }) => (
                      <FormItem className="rounded-md border overflow-hidden">
                        <div className="flex flex-row items-center space-x-2 p-3 bg-background">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Deposit Required
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Require a security deposit
                            </FormDescription>
                          </div>
                        </div>
                        {field.value && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/50 bg-muted/30">
                            <FormField
                              control={form.control}
                              name="depositValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Deposit Amount
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="h-8"
                                      {...field}
                                      value={field.value?.toString() || ''}
                                      onChange={(e) => {
                                        const value =
                                          e.target.value === ''
                                            ? 0
                                            : Number.parseFloat(e.target.value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enableRentalDurationLimit"
                    render={({ field }) => (
                      <FormItem className="rounded-md border overflow-hidden">
                        <div className="flex flex-row items-center space-x-2 p-3 bg-background">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Set Duration Limit
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Set a maximum rental duration
                            </FormDescription>
                          </div>
                        </div>
                        {field.value && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/50 bg-muted/30">
                            <FormField
                              control={form.control}
                              name="rentalDurationLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Max Duration (days)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="h-8"
                                      placeholder="0"
                                      {...field}
                                      value={
                                        field.value === null ? '' : field.value
                                      }
                                      onChange={(e) => {
                                        const value =
                                          e.target.value === ''
                                            ? null
                                            : Number(e.target.value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableLateFee"
                    render={({ field }) => (
                      <FormItem className="rounded-md border overflow-hidden">
                        <div className="flex flex-row items-center space-x-2 p-3 bg-background">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Set Late Fee
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Charge a fee for late returns
                            </FormDescription>
                          </div>
                        </div>
                        {field.value && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/50 bg-muted/30">
                            <FormField
                              control={form.control}
                              name="lateFee"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Late Fee (per day)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="h-8"
                                      placeholder="0.00"
                                      {...field}
                                      value={
                                        field.value === null ? '' : field.value
                                      }
                                      onChange={(e) => {
                                        const value =
                                          e.target.value === ''
                                            ? null
                                            : Number(e.target.value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enableAutoClose"
                    render={({ field: checkboxField }) => (
                      <FormItem className="rounded-md border overflow-hidden">
                        <div className="flex flex-row items-center space-x-2 p-3 bg-background">
                          <FormControl>
                            <Checkbox
                              checked={checkboxField.value}
                              onCheckedChange={checkboxField.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Set Auto Close Date
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Automatically close the listing on a specific date
                            </FormDescription>
                          </div>
                        </div>
                        {checkboxField.value && (
                          <div className="px-3 pb-3 pt-1 border-t border-border/50 bg-muted/30">
                            <FormField
                              control={form.control}
                              name="autoCloseDate"
                              render={({ field: dateField }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Close Date
                                  </FormLabel>
                                  <div className="grid gap-2">
                                    {/* Simplified date picker implementation */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !dateField.value &&
                                          'text-muted-foreground',
                                      )}
                                      onClick={() => {
                                        // Directly toggle the calendar
                                        setCalendarOpen(!calendarOpen);
                                        console.log(
                                          'Calendar button clicked, setting open to:',
                                          !calendarOpen,
                                        );
                                      }}
                                    >
                                      {dateField.value ? (
                                        format(new Date(dateField.value), 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>

                                    {/* Render calendar directly when open */}
                                    {calendarOpen && (
                                      <div
                                        ref={calendarRef}
                                        className="absolute z-50 bg-background border rounded-md shadow-md mt-1 p-3"
                                        style={{
                                          position: 'absolute',
                                          zIndex: 9999,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                                          <Calendar
                                            mode="single"
                                            selected={
                                              dateField.value
                                                ? new Date(dateField.value)
                                                : undefined
                                            }
                                            onSelect={(date) => {
                                              if (date) {
                                                dateField.onChange(
                                                  date.toISOString(),
                                                );
                                                setTimeout(
                                                  () => setCalendarOpen(false),
                                                  100,
                                                );
                                              } else {
                                                dateField.onChange(undefined);
                                              }
                                            }}
                                            disabled={(date) =>
                                              date < new Date()
                                            }
                                            initialFocus
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Per Day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {listingType === 'giveaway' && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-medium">Giveaway Details</h3>
                <FormField
                  control={form.control}
                  name="recipientRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe any requirements for recipients"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify any conditions or requirements for the recipient
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {listingType === 'swap' && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-medium">Swap Details</h3>
                <FormField
                  control={form.control}
                  name="swapInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Swap Interest</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you're interested in receiving in return"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what youre looking to receive in exchange
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="gap-4 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
