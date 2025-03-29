'use client';

import { ArrowLeft, Moon, Phone, Sun, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ListingPage() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-5xl rounded-lg border border-border bg-card">
          {/* Back Button */}
          <div className="border-b border-border p-4">
            <Link
              href="/anuncios"
              className="flex items-center text-sm text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Link>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2">
            {/* Product Image */}
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Corta-Relvas"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              {/*carousel do shadcn*/}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-foreground">
                Corta-Relvas
              </h1>
              <p className="text-lg text-muted-foreground">Como Novo</p>

              <div className="mt-4">
                <p className="text-foreground">
                  Vendo cortador de relvas em ótimo estado, funciona super bem e
                  é fácil de usar. Ideal para manter o jardim sempre bonito sem
                  muito esforço. Só estou a vender porque troquei por um modelo
                  maior. Posso entregar na região ou combinar a retirada.
                </p>
              </div>

              <div className="mt-8">
                <p className="text-4xl font-bold text-foreground">€199.99</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="rounded-md border border-input bg-background px-4 py-3 text-center font-medium text-foreground">
                  {t('makeanoffer')}
                </button>
                <button className="rounded-md bg-emerald-500 px-4 py-3 text-center font-medium text-white">
                  {t('buy')}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Seller */}
          <div className="border-t border-border p-6">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              {t('contact')}
            </h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-blue-600">
                  <div className="flex h-full items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Enrique Rodrigues
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('member')} Data de Membro
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">935 999 999</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
