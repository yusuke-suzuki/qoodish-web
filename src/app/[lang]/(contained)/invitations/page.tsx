import type { Metadata } from 'next';
import CoauthorshipInvitationList from '../../../../components/coauthors/CoauthorshipInvitationList';
import { getCoauthorshipInvitations } from '../../../../lib/coauthorshipInvitations';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.invites} | Qoodish`;
  const description = dict['meta description'];
  const endpoint = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;

  return {
    title,
    description,
    robots: 'noindex',
    alternates: {
      canonical: `${endpoint}/${lang}/invitations`,
      languages: {
        en: `${endpoint}/en/invitations`,
        ja: `${endpoint}/ja/invitations`,
        'x-default': `${endpoint}/en/invitations`
      }
    }
  };
}

export default async function InvitationsPage({ params }: Props) {
  const { lang } = await params;
  const invitations = await getCoauthorshipInvitations(lang);

  return <CoauthorshipInvitationList invitations={invitations} />;
}
