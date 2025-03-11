// app/api/authentication/signup/route.ts
import { createClient } from '@/utils/supabase/client'; ///Ter atenção ser é client ou server

/**
 * Atualiza a Password do utilizador autenticado.
 * @param {string} newPassword - A nova Password do utilizador.
 * @returns {Promise<void>} - Lança um erro se a atualização falhar.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = createClient(); //cria um cliente supabase
  const { data: user } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utilizador não autenticado');
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword }); // atualiza a Password do user
  if (error) {
    throw new Error('Falha ao atualizar Password no Supabase');
  }
}
