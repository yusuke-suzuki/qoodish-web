export type StaffRole = {
  id: number;
  name: string;
};

export type StaffMember = {
  id: number;
  email: string;
  revoked_at: string | null;
  roles: StaffRole[];
};

export type Role = StaffRole & {
  description: string | null;
  permissions: string[];
};

export type GrantInput = {
  email: string;
  role_id: number;
};

export function parseGrant(email: unknown, roleId: unknown): GrantInput | null {
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const id = typeof roleId === 'string' ? Number(roleId) : Number.NaN;

  if (!trimmedEmail || !Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return { email: trimmedEmail, role_id: id };
}
