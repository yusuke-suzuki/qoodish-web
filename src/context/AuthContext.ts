import { User } from 'firebase';
import { createContext } from 'react';

type ContextProps = {
  currentUser: User;
  setCurrentUser: Function;
};

const AuthContext = createContext<ContextProps>({
  currentUser: null,
  setCurrentUser: () => {}
});

export default AuthContext;
