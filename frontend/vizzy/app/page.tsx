import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  Repeat,
  ShoppingBag,
  Clock,
  Shield,
  Leaf,
  Users,
  MessageSquare,
  Star,
} from 'lucide-react';
import NavBar from '@/components/layout/nav-bar';
import { getServerUser } from '@/utils/token/get-server-user';
import { Footer } from '@/components/layout/footer';
import { getTranslations } from 'next-intl/server';

export default async function LandingPage() {
  const t = await getTranslations('homepage');
  const userMetadata = await getServerUser();
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar username={userMetadata?.username || ''} avatarUrl={''} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="text-green-600">{t('title')}</span>
                  </h1>
                  <p className="text-2xl font-semibold">{t('subtitle')}</p>
                  <p className="text-xl text-muted-foreground">{t('slogan')}</p>
                </div>
                <p className="max-w-[500px] text-muted-foreground">
                  {t('description')}
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 h-11 px-5 py-2 text-base">
                    {t('ctastart')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 h-11 px-5 py-2 text-base"
                  >
                    {t('ctalearnmore')}
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[500px] w-full max-w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-[40px] blur-3xl"></div>
                  <div className="relative h-full w-full flex items-center justify-center">
                    <div className="relative w-[280px] h-[560px] rounded-[40px] border-8 border-background shadow-2xl overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=560&width=280"
                        alt="Vizzy App Mockup"
                        width={280}
                        height={560}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-vizzy" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('whyvizzy')}
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                {t('whyvizzydescription')}
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mt-12">
              <Card className="border-none shadow-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div className="grid gap-1">
                    <CardTitle>{t('benefits.sustainability.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t('benefits.sustainability.description')}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="grid gap-1">
                    <CardTitle>{t('benefits.security.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t('benefits.security.description')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="transactions"
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('transactions')}
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                {t('transactionsdesc')}
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3 mt-12">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <div className="grid gap-1 text-center">
                    <CardTitle>{t('transactiontypes.sell')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {t('transactiontypes.lbsell')}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Repeat className="h-8 w-8 text-primary" />
                  </div>
                  <div className="grid gap-1 text-center">
                    <CardTitle>{t('transactiontypes.exchange')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {t('transactiontypes.lbexchange')}
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <div className="grid gap-1 text-center">
                    <CardTitle>{t('transactiontypes.rent')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {t('transactiontypes.lbrent')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('howitworks')}
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                {t('lbworks')}
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('steps.1')}</h3>
                <p className="text-muted-foreground">{t('steps.1Lb')}</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('steps.2')}</h3>
                <p className="text-muted-foreground">{t('steps.2lb')}</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('steps.3')}</h3>
                <p className="text-muted-foreground">{t('steps.3Lb')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('joincommunity')}
              </h2>
              <p className="md:text-xl/relaxed">{t('joindescription')}</p>
              <div className="w-full max-w-sm space-y-2 pt-4">
                <Button
                  size="lg"
                  className="w-full bg-background text-primary hover:bg-background/90"
                >
                  {t('btjoin')}
                </Button>
                <p className="text-xs">{t('lbjoinbtn')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <Footer />
      </footer>
    </div>
  );
}
