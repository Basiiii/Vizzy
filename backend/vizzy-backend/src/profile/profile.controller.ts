import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { User } from '@/user/models/user.model';
import { Request } from 'express';
import { SupabaseService } from 'src/supabase/supabase.service';

interface CustomRequest extends Request {
  cookies: Record<string, string>;
}

@Controller('profile')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}
  @Post('update-profile')
     async updateProfile(@Req() req: CustomRequest) {
        const jwtToken = req.cookies?.['auth-token'];
        console.log('Token recebido:', jwtToken);
    
        if (!jwtToken) {
          throw new Error('Token de autenticação não encontrado!');
        }
    
        const supabase = this.supabaseService.getAdminClient();
    
        // Verifique a resposta de erro do Supabase
        const { data, error } = await supabase.auth.getUser(jwtToken);
    
        if (error) {
          console.error('Erro ao obter o usuário do Supabase:', error.message);
          throw new Error('Token inválido ou expirado');
        }
    
        const user = data.user;
    
        if (!user) {
          console.error('Usuário não encontrado!');
          throw new Error('Token inválido ou expirado');
        }
    
        // Continuar com o processo de recuperação dos dados do usuário
        const userData: User = await this.userService.getMe(user.id);
        console.log(userData);
        return userData;
      }
    
  }
}
