'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/common/button';
import ListingCard from '@/components/listings/listing-card';
import type { Listing } from '@/types/listing';
import Link from 'next/link';

// Sample data to match the image
const sampleListings: Listing[] = [
  {
    id: '1',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  {
    id: '2',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  {
    id: '3',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  {
    id: '4',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  {
    id: '5',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  {
    id: '6',
    title: 'Corta-Relvas',
    type: 'sale',
    price: '199.99',
    image_url: '/placeholder.svg?height=400&width=400',
  },
  // Add more listings as needed
];

export function ListingsPage() {
  const [listings] = useState<Listing[]>(sampleListings);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
