import { Button } from '@/components/ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import {
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  PenToolIcon as Tool,
  Leaf,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('landingPage');
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-brand-500">
          <div className="w-full px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-black">
                  Vizzy.
                </h1>
                <p className="mx-auto max-w-[700px] text-black/80 md:text-xl">
                  {t('description')}
                </p>
              </div>
              <div className="space-x-4 mt-6">
                <Button
                  asChild
                  className="px-8 py-6 text-lg bg-black hover:bg-black/90 text-white cursor-pointer"
                >
                  <Link href="/">
                    {t('exploreButton')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {t('functionalities.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('functionalities.description')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-7xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <ShoppingBag className="h-10 w-10 mb-2 text-brand-500" />
                  <CardTitle>{t('functionalities.buyAndSale.title')}</CardTitle>
                  <CardDescription>
                    {t('functionalities.buyAndSale.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('functionalities.buyAndSale.text')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <RefreshCw className="h-10 w-10 mb-2 text-brand-500" />
                  <CardTitle>{t('functionalities.itemSwap.title')}</CardTitle>
                  <CardDescription>
                    {t('functionalities.itemSwap.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('functionalities.itemSwap.text')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Tool className="h-10 w-10 mb-2 text-brand-500" />
                  <CardTitle>
                    {t('functionalities.localRenting.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('functionalities.localRenting.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('functionalities.localRenting.text')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Leaf className="h-10 w-10 mb-2 text-brand-500" />
                  <CardTitle>
                    {t('functionalities.sustainability.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('functionalities.sustainability.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('functionalities.sustainability.text')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Video/Demo Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {t('functionalities.demo.title')}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('functionalities.demo.description')}
                </p>
              </div>
              <div className="mx-auto max-w-6xl w-full aspect-video overflow-hidden rounded-xl border bg-muted/50 flex items-center justify-center mt-8">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/kX9aLe1Q8YQ"
                  title="Vídeo demonstrativo da plataforma"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-brand-500">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-black">
                  {t('bottomBanner.title')}
                </h2>
                <p className="mx-auto max-w-[600px] text-black/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('bottomBanner.description')}
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Button
                  asChild
                  className="w-full bg-black text-white hover:bg-grey/90 cursor-pointer"
                  size="lg"
                >
                  <Link href="/">{t('bottomBanner.buttonText')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
