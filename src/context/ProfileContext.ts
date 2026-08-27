import { createContext } from 'react';
import type { Profile } from '../../types/index.ts';

const ProfileContext = createContext<Profile | null>(null);

export default ProfileContext;
