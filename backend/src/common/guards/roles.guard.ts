import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Support potential role formats (role or user_metadata.role from Supabase)
    const userRole = (user.role || user.user_metadata?.role || '').toLowerCase().trim();

    return requiredRoles.some(role => {
      const normalizedRequired = role.toLowerCase().trim();
      return userRole === normalizedRequired ||
        userRole.replace(/ /g, '-') === normalizedRequired ||
        userRole.includes(normalizedRequired);
    });
  }
}
