import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Controller('api/anuncio')
export class AnuncioController {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  @Get(':id')
  async getAnuncio(@Param('id') id: string) {
    const anuncioId = parseInt(id, 10);
    const { data: anuncio, error } = await this.supabase
      .from('anuncios')
      .select(
        'id, nome, estado, descricao, preco, anunciante:nome, telefone, membroDesde',
      )
      .eq('id', anuncioId)
      .single();

    if (error || !anuncio) {
      throw new NotFoundException('Ad not found');
    }

    return anuncio;
  }
}
