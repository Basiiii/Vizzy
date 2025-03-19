import { Controller, Get, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { Request } from 'express';
import { SupabaseService } from 'src/supabase/supabase.service';

interface CustomRequest extends Request {
  cookies: Record<string, string>;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('me')
  async getMe(@Req() req: CustomRequest): Promise<User | null> {
    const jwtToken = req.cookies?.['auth-token'];
    console.log(jwtToken);

    if (!jwtToken) {
      throw new Error('Token de autenticação não encontrado!');
    }

    const supabase = this.supabaseService.getAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwtToken);
    //console.log(user.id);

    //console.log('User from Supabase:', user); // Verifique o valor de 'user'
    //console.log('User ID:', user?.id);

    if (Error || !user) {
      throw new Error('Invalid or Expired Token!');
    }
    console.error(user.id);
    const userData: User = await this.userService.getMe(user.id);

    //console.log(user.id);
    return userData;
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }
}
