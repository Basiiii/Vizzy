'use client';

import { ArrowLeft, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/data-display/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/data-display/carousel';

// Definição da interface para o anúncio
interface Anuncio {
  id: string;
  nome: string;
  estado: string;
  descricao: string;
  preco: number;
  imagem?: string;
  anunciante: string;
  telefone: string;
  membroDesde: string;
}

export default function ListingPage() {
  const t = useTranslations('common');

  const router = useRouter();
  const { id } = router.query;
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/listings/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Anúncio não encontrado');
          return res.json();
        })
        .then((data) => {
          setAnuncio(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>{t('loading')}</p>;
  if (error)
    return (
      <p>
        {t('error')}: {error}
      </p>
    );
  if (!anuncio) return <p>{t('notfound')}</p>;

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
                  src={
                    anuncio.imagem || '/placeholder.svg?height=400&width=400'
                  }
                  alt={anuncio.nome}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-4xl font-semibold">
                              {index + 1}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-foreground">
                {anuncio.nome}
              </h1>
              <p className="text-lg text-muted-foreground">{anuncio.estado}</p>

              <div className="mt-4">
                <p className="text-foreground">{anuncio.descricao}</p>
              </div>

              <div className="mt-8">
                <p className="text-4xl font-bold text-foreground">
                  {anuncio.preco}€
                </p>
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
                    {anuncio.anunciante}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('member')}
                    {anuncio.membroDesde}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {anuncio.telefone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
