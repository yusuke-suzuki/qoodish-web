'use client';

import type { ReactNode } from 'react';
import type { Notification, Profile } from '../../../types/index.ts';
import NotificationsContext from '../../context/NotificationsContext.ts';
import ProfileContext from '../../context/ProfileContext.ts';

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
  return (
    <ProfileContext.Provider value={profilePromise}>
      <NotificationsContext.Provider value={notificationsPromise}>
        {children}
      </NotificationsContext.Provider>
    </ProfileContext.Provider>
  );
}
