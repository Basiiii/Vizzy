'use client';

import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/common/button';
import { Card, CardFooter } from '@/components/ui/data-display/card';

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="p-4">
        {/* Tabs and Button */}
        <div className="mb-6 flex items-center justify-between">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-md">
            Novo Anúncio
          </Button>
        </div>
        {/* Product Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="bg-gray-900 border-0 overflow-hidden rounded-lg"
            >
              <div className="relative">
                <div className="absolute right-2 top-2 rounded bg-white px-2 py-0.5 text-xs font-medium text-black">
                  Venda
                </div>
                <h3 className="absolute left-4 top-4 text-lg font-bold text-white">
                  Nome
                </h3>
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Corta-Relvas"
                  width={400}
                  height={200}
                  className="h-40 w-full object-cover"
                />
              </div>
              <CardFooter className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-white">Estado</p>
                  <p className="font-bold text-white">Preço €</p>
                </div>
                <button className="rounded-full p-1 hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5 text-white" />
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
