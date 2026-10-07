import type { CoauthorshipInvitation } from '../../types/index.ts';
import { apiFetchList } from './api.ts';

export function getCoauthorshipInvitations(
  lang: string
): Promise<CoauthorshipInvitation[]> {
  return apiFetchList<CoauthorshipInvitation>('/me/coauthorship_invitations', {
    lang,
    next: { revalidate: 0 }
  });
}
