'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BlockButtonProps {
  targetUserId: string;
}

export default function BlockButton({ targetUserId }: BlockButtonProps) {
  const [blocked, setBlocked] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função para buscar o status de bloqueio
  const fetchBlockStatus = async () => {
    try {
      const response = await fetch(`/api/user/block-status?targetUserId=${targetUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclui cookies para autenticação
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch block status:', errorData);
        throw new Error(errorData.message || 'Failed to fetch block status');
      }
  
      const data = await response.json();
      setBlocked(data.isBlocked);
    } catch (error) {
      console.error('Error fetching block status:', error);
    }
  };

  // Função para alternar o status de bloqueio
  const toggleBlockStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/block-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Inclui cookies para autenticação
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to toggle block status:', errorData);
        throw new Error(errorData.message || 'Failed to toggle block status');
      }

      const data = await response.json();
      setBlocked((prev) => !prev);
      alert(data.message); // Opcional: Mostrar mensagem de sucesso
    } catch (error) {
      console.error('Error toggling block status:', error);
      alert('Failed to toggle block status');
    } finally {
      setLoading(false);
    }
  };

  // Buscar o status de bloqueio ao carregar o componente
  useEffect(() => {
    fetchBlockStatus();
  }, [targetUserId]);

  // Não exibir o botão se for o próprio perfil
  if (isCurrentUser) {
    return null;
  }

  return (
    <Button variant="outline" onClick={toggleBlockStatus} disabled={loading}>
      {loading ? 'Processing...' : blocked ? 'Unblock User' : 'Block User'}
    </Button>
  );
}
