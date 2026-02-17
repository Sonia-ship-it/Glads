import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private supabaseService: SupabaseService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Use Supabase to verify the token
      const { data, error } = await this.supabaseService.getClient().auth.getUser(token);
      
      if (error || !data.user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      // Get full user profile
      const user = await this.authService.validateUser(data.user.id);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid token');
    }
  }
}

