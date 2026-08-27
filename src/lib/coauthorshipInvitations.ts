import type { CoauthorshipInvitation } from '../../types/index.ts';
import { apiFetch } from './api.ts';

export async function getCoauthorshipInvitations(
  lang: string
): Promise<CoauthorshipInvitation[]> {
  const { data } = await apiFetch<CoauthorshipInvitation[]>(
    '/me/coauthorship_invitations',
    {
      lang,
      next: { revalidate: 0 }
    }
  );
  return data ?? [];
}
