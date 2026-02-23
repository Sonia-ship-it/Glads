import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private authService: AuthService,
    private supabaseService: SupabaseService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const userId = await this.resolveUserIdFromToken(token);
    const user = await this.authService.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      sub: user.id,
    };
  }

  private async resolveUserIdFromToken(token: string): Promise<string> {
    const supabaseJwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    const allowUnverifiedDevTokens =
      this.configService.get<string>('ALLOW_UNVERIFIED_SUPABASE_TOKENS') === 'true';

    // Prefer local verification to avoid network dependency during auth checks.
    if (supabaseJwtSecret) {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub?: string }>(token, {
          secret: supabaseJwtSecret,
        });
        if (payload?.sub) return payload.sub;
      } catch {
        // Fall back to Supabase remote verification below.
      }
    }

    // Development fallback: decode token payload without signature verification.
    // Use only in local development when Supabase network access is unavailable.
    if (allowUnverifiedDevTokens) {
      const decodedSub = this.decodeSubWithoutVerification(token);
      if (decodedSub) return decodedSub;
    }

    try {
      const { data, error } = await this.supabaseService.getClient().auth.getUser(token);
      if (error || !data.user?.id) {
        throw new UnauthorizedException('Invalid token');
      }
      return data.user.id;
    } catch (err: any) {
      if (this.isUpstreamTimeout(err)) {
        throw new ServiceUnavailableException('Authentication service is temporarily unavailable');
      }
      throw new UnauthorizedException(err.message || 'Invalid token');
    }
  }

  private decodeSubWithoutVerification(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadPart = parts[1];
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payloadJson = Buffer.from(padded, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson) as { sub?: string };
      return payload?.sub || null;
    } catch {
      return null;
    }
  }

  private isUpstreamTimeout(err: any): boolean {
    const directCode = err?.code;
    const causeCode = err?.cause?.code;
    const message = String(err?.message || '').toLowerCase();
    return (
      directCode === 'UND_ERR_CONNECT_TIMEOUT' ||
      causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
      message.includes('connect timeout')
    );
  }
}
