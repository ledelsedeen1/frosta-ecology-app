import { UserRole } from './types';

export type RoleLike = UserRole | string | null | undefined;

export function normalizeRole(role: RoleLike): UserRole {
  switch (role) {
    case 'administrator':
    case 'admin':
      return 'admin';
    case 'board_member':
    case 'board':
      return 'board';
    case 'member':
    case 'volunteer':
    case 'guest':
      return role;
    default:
      return 'guest';
  }
}

export function isGuestRole(role: RoleLike): boolean {
  return normalizeRole(role) === 'guest';
}

export function isBoardRole(role: RoleLike): boolean {
  return normalizeRole(role) === 'board';
}

export function isAdministratorRole(role: RoleLike): boolean {
  return normalizeRole(role) === 'admin';
}

export function isBoardOrAdminRole(role: RoleLike): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'board' || normalizedRole === 'admin';
}
