import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { Request } from 'express';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UUID } from 'crypto';

interface CustomRequest extends Request {
  cookies: Record<string, string>;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
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

  /*   @Delete('delete')
  deleteUSer(
    @Req() req: CustomRequest,
  ) : Promise<{ message: string } | { error: string }> {
    SupabaseService;
    const jwtToken = req.cookies?.['arroz'];
    //const token = req.headers.values;
    //return this.userService.deleteUser(token);
  } */
}
