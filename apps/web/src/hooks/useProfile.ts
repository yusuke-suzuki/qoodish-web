import { use, useContext } from 'react';
import type { Profile } from '../../types/index.ts';
import ProfileContext from '../context/ProfileContext.ts';

export default function useProfile(): Profile | null {
  return use(useContext(ProfileContext));
}
