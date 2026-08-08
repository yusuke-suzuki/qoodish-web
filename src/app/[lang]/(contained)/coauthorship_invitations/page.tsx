import type { Metadata } from 'next';
import CoauthorshipInvitationList from '../../../../components/coauthors/CoauthorshipInvitationList';
import { getCoauthorshipInvitations } from '../../../../lib/coauthorshipInvitations';
import { getDictionary } from '../../../../utils/getDictionary';
import { buildAlternates } from '../../../../utils/metadata';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.invites} | Qoodish`;
  const description = dict['meta description'];

  return {
    title,
    description,
    robots: 'noindex',
    alternates: buildAlternates(lang, '/coauthorship_invitations')
  };
}

export default async function InvitationsPage({ params }: Props) {
  const { lang } = await params;
  const invitations = await getCoauthorshipInvitations(lang);

  return <CoauthorshipInvitationList invitations={invitations} />;
}
