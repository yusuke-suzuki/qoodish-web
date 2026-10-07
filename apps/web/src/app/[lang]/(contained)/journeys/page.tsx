import type { Metadata } from 'next';
import SignInRequired from '../../../../components/auth/SignInRequired.tsx';
import UserJourneys from '../../../../components/profiles/UserJourneys.tsx';
import { getServerAuthState } from '../../../../lib/auth.ts';
import { getMyJourneys } from '../../../../lib/journeys.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict['journey log']} | Qoodish`,
    robots: 'noindex'
  };
}

export default async function JourneysPage({ params }: Props) {
  const { lang } = await params;
  const { authenticated, token } = await getServerAuthState();

  if (!authenticated) {
    return <SignInRequired title={getDictionary(lang)['journey log']} />;
  }

  const journeys = await getMyJourneys(lang, token);

  return <UserJourneys journeys={journeys} />;
}
