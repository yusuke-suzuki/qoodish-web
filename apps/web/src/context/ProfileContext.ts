import { createContext } from 'react';
import type { Profile } from '../../types/index.ts';

const ProfileContext = createContext<Promise<Profile | null>>(
  Promise.resolve(null)
);

export default ProfileContext;
