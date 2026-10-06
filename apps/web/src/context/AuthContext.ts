import { createContext } from 'react';

export type SignOutCleanup = () => Promise<void>;

type ContextProps = {
  authenticated: boolean;
  uid: string | null;
  isLoading: boolean;
  signInRequired: boolean;
  setSignInRequired: (value: boolean) => void;
  signOut: () => Promise<void>;
  addSignOutCleanup: (cleanup: SignOutCleanup) => () => void;
};

const AuthContext = createContext<ContextProps>({
  authenticated: false,
  uid: null,
  isLoading: true,
  signInRequired: false,
  setSignInRequired: () => {},
  signOut: async () => {},
  addSignOutCleanup: () => () => {}
});

export default AuthContext;
