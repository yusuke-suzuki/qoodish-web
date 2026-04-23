import { createContext } from 'react';
import type { Profile } from '../../types';

const ProfileContext = createContext<Profile | null>(null);

export default ProfileContext;
