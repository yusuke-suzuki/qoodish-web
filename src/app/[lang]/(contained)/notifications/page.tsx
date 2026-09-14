import type { Metadata } from 'next';
import SignInRequired from '../../../../components/auth/SignInRequired.tsx';
import NotificationsFeed from '../../../../components/notifications/NotificationsFeed.tsx';
import { getServerAuthState } from '../../../../lib/auth.ts';
import { getNotifications } from '../../../../lib/users.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return {
    title: `${dict.notifications} | Qoodish`,
    robots: 'noindex'
  };
}

export default async function NotificationsPage({ params }: Props) {
  const { lang } = await params;
  const { authenticated } = await getServerAuthState();

  if (!authenticated) {
    return <SignInRequired title={getDictionary(lang).notifications} />;
  }

  const notifications = await getNotifications(lang);

  return <NotificationsFeed notifications={notifications} />;
}
