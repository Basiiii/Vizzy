import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
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
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Delete('delete')
  async deleteUSer(
    @Req() req: CustomRequest,
  ) /*: Promise<{ message: string } | { error: string }>*/ {
    const supabase = this.supabaseService.getAdminClient();
    const jwtToken = req.cookies?.['auth-token'];

    const {
      data: { user },
    } = await supabase.auth.getUser(jwtToken);

    return this.userService.deleteUser(user.id);
  }
}
