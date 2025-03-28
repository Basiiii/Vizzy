import { Controller, Delete, Get, Param, Req, UseGuards, Post, Body, Query } from '@nestjs/common';
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
  deleteUSer(
    @Req() req: CustomRequest,
  ) /*: Promise<{ message: string } | { error: string }>*/ {
    SupabaseService;
    const jwtToken = req.cookies?.['arroz'];

    //const token = req.headers.values;
    //return this.userService.deleteUser(token);
  }

  @Get('block-status')
  @UseGuards(JwtAuthGuard)  
  async checkBlockStatus(
    @Req() req: Request,
    //@Query('targetUserId') targetUserId: string
  ): Promise<{ isBlocked: boolean }> {
    console.log('checkBlockStatus endpoint called');
    //console.log('Received targetUserId:', targetUserId);
  
    const userData = (req as any).user;
    console.log('Authenticated user:', userData);
  
    const userId = userData?.sub;
    console.log('Authenticated userId:', userId);
  /* 
    if (!targetUserId) {
      throw new Error('targetUserId is required');
    } */
  /* 
    const isBlocked = await this.userService.isUserBlocked(userId, targetUserId);
    console.log(`Block status for user ${userId} and target ${targetUserId}: ${isBlocked}`);
     */
    return { isBlocked: false }; // Retorna o status de bloqueio (substitua pela lógica real)
  }
      
  @Post('block-toggle')
  @UseGuards(JwtAuthGuard)
  async toggleBlockUser(
    @Req() req: Request, // Usamos o tipo Request do Express
    @Body('targetUserId') targetUserId: string
  ): Promise<{ message: string }> {
    const userData = (req as any).user; // Obtemos os dados do usuário autenticado
    const userId = userData.sub; // ID do usuário autenticado

    if (!targetUserId) {
      throw new Error('targetUserId is required');
    }

    const isBlocked = await this.userService.toggleBlockUser(userId, targetUserId);
    const message = isBlocked
      ? `User ${targetUserId} has been blocked.`
      : `User ${targetUserId} has been unblocked.`;
    return { message };
  }
}
