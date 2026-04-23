import { createContext } from 'react';

type ContextProps = {
  authenticated: boolean;
  uid: string | null;
  isLoading: boolean;
  signInRequired: boolean;
  setSignInRequired: (value: boolean) => void;
};

const AuthContext = createContext<ContextProps>({
  authenticated: false,
  uid: null,
  isLoading: true,
  signInRequired: false,
  setSignInRequired: () => {}
});

export default AuthContext;
