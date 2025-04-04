import Link from 'next/link';
import { Button } from '@/components/ui/common/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import { Badge } from '@/components/ui/data-display/badge';

export default function TransactionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-sm text-gray-400">Transaction Details - Dark</div>
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
              <div className="mb-6">
                <Link
                  href="/"
                  className="flex items-center text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  Voltar às transações
                </Link>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Transação #{params.id}</h3>
                <Badge variant="outline">Pendente</Badge>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Criado em 29 Fev, 2023
              </p>

              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-400 mb-4">
                  Informações da Transação
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 mb-1">Item</p>
                    <p className="font-medium">Corta-Relvas</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Valor</p>
                    <p className="font-medium">€ 150,00</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Comprador</p>
                    <p className="font-medium">José Alves</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Vendedor</p>
                    <p className="font-medium">Enrique Rodrigues</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Concluir Transação
                </Button>
                <Button variant="destructive" className="flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  Cancelar Transação
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
