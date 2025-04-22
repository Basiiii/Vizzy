import { SupabaseClient } from '@supabase/supabase-js';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-or-service-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserFavoriteProducts(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_listings (id, name)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Erro ao buscar favoritos: ${error.message}`);
  }

  return data.map((fav: any) => fav.product_listings);
}
