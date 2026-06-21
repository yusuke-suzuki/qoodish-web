import type { CoauthorshipInvitation } from '../../types';
import { apiFetch } from './api';

export async function getCoauthorshipInvitations(
  lang: string
): Promise<CoauthorshipInvitation[]> {
  const { data } = await apiFetch<CoauthorshipInvitation[]>(
    '/coauthorship_invitations',
    {
      lang,
      next: { revalidate: 0 }
    }
  );
  return data ?? [];
}
