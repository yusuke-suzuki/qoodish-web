import { User } from 'firebase/auth';
import { createContext } from 'react';

type ContextProps = {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
  signInRequired: boolean;
  setSignInRequired: (value: boolean) => void;
};

const AuthContext = createContext<ContextProps>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: true,
  signInRequired: false,
  setSignInRequired: () => {}
});

export default AuthContext;
