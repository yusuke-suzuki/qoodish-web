import { createContext } from 'react';

type ContextProps = {
  drawerOpen: boolean;
  setDrawerOpen: Function;
};

const DrawerContext = createContext<ContextProps>({
  drawerOpen: false,
  setDrawerOpen: () => {}
});

export default DrawerContext;
