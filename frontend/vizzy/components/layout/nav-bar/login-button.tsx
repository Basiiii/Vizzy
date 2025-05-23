'use client';

import { ROUTES } from '@/lib/constants/routes/routes';
import { Button } from '../../ui/common/button';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
  label: string;
}

export default function LoginButton({ label }: LoginButtonProps) {
  const routes = useRouter();

  return (
    <Button
      className="cursor-pointer"
      onClick={() => routes.push(ROUTES.LOGIN)}
    >
      {label}
    </Button>
  );
}
