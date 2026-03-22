import type { User, UserInfo } from 'firebase/auth';
import { createContext } from 'react';

type ContextProps = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  providerData: UserInfo[];
  setProviderData: (data: UserInfo[]) => void;
  isLoading: boolean;
  signInRequired: boolean;
  setSignInRequired: (value: boolean) => void;
};

const AuthContext = createContext<ContextProps>({
  currentUser: null,
  setCurrentUser: () => {},
  providerData: [],
  setProviderData: () => {},
  isLoading: true,
  signInRequired: false,
  setSignInRequired: () => {}
});

export default AuthContext;
