'use server';

import { createAdminClient } from '@/lib/utils/supabase/server';

type MonthlyOverview = {
  [key: string]: number;
};

export async function getUserOverview(
  authToken: string,
): Promise<MonthlyOverview> {
  const supabase = await createAdminClient();
  const user = await supabase.auth.getUser(authToken);
  const userId = user.data.user?.id;

  if (!user) {
    throw new Error('No user found');
  }

  console.log('Calling get_user_overview with userId:', userId); // Debug log
  const { data, error } = await supabase.rpc('get_user_overview', {
    userid: userId,
  });
  console.log('Supabase RPC data:', data); // Debug log
  console.log('Supabase RPC error:', error); // Debug log

  if (error) {
    throw new Error(error.message);
  }

  return data as MonthlyOverview;
}
