/**
 * Roles Guard
 * Implements role-based access control for routes
 */

import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      return false;
    }

    this.logger.debug(
      `RolesGuard: User role = "${user.role}", Required roles = ${JSON.stringify(requiredRoles)}`,
    );

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `RolesGuard: Access denied. User role "${user.role}" not in required roles ${JSON.stringify(requiredRoles)}`,
      );
    }

    return hasRole;
  }
}
