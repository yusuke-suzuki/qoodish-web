'use client';

import type { ReactNode } from 'react';
import type { NotificationsPage, Profile } from '../../../types/index.ts';
import ProfileContext from '../../context/ProfileContext.ts';
import UnreadNotificationsContext from '../../context/UnreadNotificationsContext.ts';

type Props = {
  profilePromise: Promise<Profile | null>;
  unreadNotificationsPromise: Promise<NotificationsPage>;
  children: ReactNode;
};

export default function AccountProviders({
  profilePromise,
  unreadNotificationsPromise,
  children
}: Props) {
  return (
    <ProfileContext.Provider value={profilePromise}>
      <UnreadNotificationsContext.Provider value={unreadNotificationsPromise}>
        {children}
      </UnreadNotificationsContext.Provider>
    </ProfileContext.Provider>
  );
}
