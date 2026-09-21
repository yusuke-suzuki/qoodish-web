'use client';

import {
  AccountCircle,
  Bookmarks,
  DirectionsWalk,
  Explore,
  Home,
  Mail,
  Settings,
  type SvgIconComponent
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import type { Profile } from '../../types/index.ts';
import AuthContext from '../context/AuthContext.ts';
import useDictionary from './useDictionary.ts';
import useLocalePath from './useLocalePath.ts';

export type NavDestination = {
  key: string;
  label: string;
  icon: SvgIconComponent;
  href: string | undefined;
  selected: boolean;
  disabled: boolean;
  primary: boolean;
};

export default function useNavDestinations(
  profile: Profile | null
): NavDestination[] {
  const { authenticated } = useContext(AuthContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const pathname = usePathname();

  const destinations: NavDestination[] = [
    {
      key: 'home',
      label: dictionary.home,
      icon: Home,
      href: localePath('/'),
      selected: /^\/[a-z]+\/?$/.test(pathname),
      disabled: false,
      primary: true
    },
    {
      key: 'discover',
      label: dictionary.discover,
      icon: Explore,
      href: localePath('/discover'),
      selected: pathname.endsWith('/discover'),
      disabled: false,
      primary: true
    }
  ];

  if (!authenticated) {
    return destinations;
  }

  return destinations.concat([
    {
      key: 'journeys',
      label: dictionary['journey log'],
      icon: DirectionsWalk,
      href: localePath('/journeys'),
      selected: pathname.endsWith('/journeys'),
      disabled: false,
      primary: true
    },
    {
      key: 'profile',
      label: dictionary.profile,
      icon: AccountCircle,
      href: profile ? localePath(`/users/${profile.id}`) : undefined,
      selected: pathname.includes('/users/'),
      disabled: !profile,
      primary: true
    },
    {
      key: 'bookmarks',
      label: dictionary.bookmarks,
      icon: Bookmarks,
      href: localePath('/bookmarks'),
      selected: pathname.endsWith('/bookmarks'),
      disabled: false,
      primary: false
    },
    {
      key: 'invites',
      label: dictionary.invites,
      icon: Mail,
      href: localePath('/coauthorship_invitations'),
      selected: pathname.endsWith('/coauthorship_invitations'),
      disabled: false,
      primary: false
    },
    {
      key: 'settings',
      label: dictionary.settings,
      icon: Settings,
      href: localePath('/settings'),
      selected: pathname.endsWith('/settings'),
      disabled: false,
      primary: false
    }
  ]);
}
