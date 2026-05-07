'use client';

import { type ReactNode, use } from 'react';
import type { Notification, Profile } from '../../../types';
import NotificationsContext from '../../context/NotificationsContext';
import ProfileContext from '../../context/ProfileContext';

type Props = {
  profilePromise: Promise<Profile | null>;
  notificationsPromise: Promise<Notification[]>;
  children: ReactNode;
};

export default function AccountProviders({
  profilePromise,
  notificationsPromise,
  children
}: Props) {
  const profile = use(profilePromise);
  const notifications = use(notificationsPromise);

  return (
    <ProfileContext.Provider value={profile}>
      <NotificationsContext.Provider value={notifications}>
        {children}
      </NotificationsContext.Provider>
    </ProfileContext.Provider>
  );
}
