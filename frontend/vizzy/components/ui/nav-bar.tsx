"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Store, CreditCard, Settings, LogOut } from "lucide-react";
import { useState } from "react";

interface NavBarProps {
  userName: string;
  avatarUrl: string;
}

export default function NavBar({ userName, avatarUrl }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900">
      <nav className="flex items-center justify-between px-6 py-2 bg-black text-white">
        <div className="flex items-center">
          <span className="text-xl font-semibold">Vizzy.</span>
        </div>

        <div className="relative">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="outline-none">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
          </DropdownMenu>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 z-50">
              <div className="bg-zinc-1000 border border-zinc-800 rounded-md shadow-lg overflow-hidden">
                <div className="px-4 py-3 text-base font-medium border-b border-zinc-800">
                  {userName}
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-800">
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-800">
                    <Store className="h-4 w-4" />
                    <span>Propostas</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-800">
                    <CreditCard className="h-4 w-4" />
                    <span>Transações</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-800">
                    <Settings className="h-4 w-4" />
                    <span>Definições</span>
                  </button>
                </div>

                <div className="border-t border-zinc-800 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-zinc-800">
                    <LogOut className="h-4 w-4" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}



