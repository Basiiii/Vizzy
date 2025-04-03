import Link from 'next/link';
import { Button } from '@/components/ui/common/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import { Badge } from '@/components/ui/data-display/badge';

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-sm text-gray-400">Transactions - Dark</div>
        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">
          JA
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Vizzy.</h1>
          <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <div className="bg-[#121212] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Painel de Controlo</h2>

          <Tabs defaultValue="transacoes">
            <TabsList className="bg-[#1a1a1a] mb-6">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="atividade">Atividade</TabsTrigger>
              <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
            </TabsList>

            <TabsContent value="transacoes">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm">
                  Filtrar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transação Em Progresso */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Comprar Corta-Relvas</h3>
                    <Badge className="bg-yellow-500 text-black">
                      Em Progresso
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    José Alves • 29 Fev, 2023
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Estou interessado em comprar o corta-relvas que está à
                    venda. Poderia enviar mais informações sobre o modelo...
                  </p>
                  <Link href="/transacao/12345">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>

                {/* Transação Concluída */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Comprar Corta-Relvas</h3>
                    <Badge className="bg-green-500 text-black">Concluído</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    José Alves • 25 Fev, 2023
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Estou interessado em comprar o corta-relvas que está à
                    venda. Poderia enviar mais informações sobre o modelo...
                  </p>
                  <Link href="/transacao/12344">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>

                {/* Transação Cancelada */}
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Comprar Corta-Relvas</h3>
                    <Badge className="bg-red-500 text-black">Cancelado</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    José Alves • 20 Fev, 2023
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Estou interessado em comprar o corta-relvas que está à
                    venda. Poderia enviar mais informações sobre o modelo...
                  </p>
                  <Link href="/transacao/12343">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
