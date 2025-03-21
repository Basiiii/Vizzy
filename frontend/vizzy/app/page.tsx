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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Vizzy</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#why-vizzy"
              className="text-sm font-medium hover:text-primary"
            >
              Por que Vizzy
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              Como Funciona
            </Link>
            <Link
              href="#transactions"
              className="text-sm font-medium hover:text-primary"
            >
              Transações
            </Link>
            <Link
              href="#technology"
              className="text-sm font-medium hover:text-primary"
            >
              Tecnologia
            </Link>
          </nav>
          <div>
            <Button>Login</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Vizzy - A Plataforma Comunitária para um Consumo Inteligente
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Conecta-te. Partilhe. Economiza.
                  </p>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A Vizzy é uma plataforma inovadora que transforma a forma de
                  adquires e partilhares produtos dentro da tua comunidade.
                  Compra, venda, troca e alugua produtos de maneira fácil,
                  acessível e sustentável.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">
                    Comece Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Saiba Mais
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-xl border bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=350&width=500"
                      alt="Vizzy Platform"
                      width={500}
                      height={350}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="why-vizzy"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Por que Escolher a Vizzy?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A nossa plataforma oferece benefícios únicos para uma
                  experiência de consumo mais inteligente e sustentável.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Leaf className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Sustentabilidade e Economia</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Dê uma segunda vida aos produtos e reduza o desperdício
                    enquanto economiza dinheiro. Alugar uma ferramenta ou trocar
                    um produto é mais econômico e consciente do que comprar um
                    novo.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Facilidade e Segurança</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    O nosso sistema intuitivo permite criar e gerir anúncios de
                    forma rápida e segura. Com autenticação integrada e suporte
                    a propostas e contrapropostas, garantimos negociações justas
                    e transparentes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="transactions" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Variedade de Transações
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Escolha a melhor forma de negociar seus anuncios na
                  plataforma.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Venda</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Ofereça itens que não usa mais e encontre compradores
                    interessados.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Repeat className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Troca</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Negocie produtos e obtenha exatamente o que precisa.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Aluguer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Ganhe dinheiro alugando objetos que ficam parados ou
                    economize alugando o que precisa sem comprar.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Como Funciona?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Siga estes passos simples para começar a usar a Vizzy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-8">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">1. Crie seu Perfil</h3>
                <p className="text-muted-foreground">
                  Crie a sua conta e personalize seu perfil para começar a
                  explorar as ofertas disponíveis.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">2. Publique um Anúncio</h3>
                <p className="text-muted-foreground">
                  Descreva seu produto, adicione fotos e defina se deseja
                  vender, trocar ou alugar.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">3. Negocie</h3>
                <p className="text-muted-foreground">
                  Receba propostas, converse com outros utilizadores e finalize
                  a transação de maneira segura.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">4. Finalize e Avalie</h3>
                <p className="text-muted-foreground">
                  Conclua sua transação e avalie a experiência para garantir um
                  ambiente de confiança.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex justify-center">
                <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-xl border bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=350&width=500"
                      alt="Tecnologia Vizzy"
                      width={500}
                      height={350}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Tecnologia e Segurança
                  </h2>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A Vizzy foi desenvolvida utilizando tecnologias de ponta para
                  garantir uma experiência fluida e segura. A nossa equipa
                  garante um desempenho e segurança para todas as interações na
                  plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Junte-se à Comunidade Vizzy
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Transforme a maneira como consome e partilha os produtos.
                  Liga-te com pessoas da tua vizinhança, reduza o desperdício e
                  aproveite um marketplace inteligente e colaborativo.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Button
                  size="lg"
                  className="w-full bg-background text-primary hover:bg-background/90"
                >
                  Junta-te a nós agora
                </Button>
                <p className="text-xs">
                  e comece a fazer parte dessa revolução!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Vizzy. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Termos
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Privacidade
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
