'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useContext, useState } from 'react';
import type { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import ShellContext from '../../context/ShellContext';
import useLocalePath from '../../hooks/useLocalePath';
import SignInRequiredDialog from '../auth/SignInRequiredDialog';
import CreateMapDialog from '../maps/CreateMapDialog';
import SearchDialog from './SearchDialog';

type Props = {
  children: ReactNode;
};

export default function ShellProvider({ children }: Props) {
  const { push } = useRouter();
  const localePath = useLocalePath();
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMapOpen, setCreateMapOpen] = useState(false);
  const [appBarHidden, setAppBarHidden] = useState(false);

  const openSearch = () => setSearchOpen(true);
  const openCreateMap = () => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }
    setCreateMapOpen(true);
  };

  const handleCreatedMap = (map: AppMap) => {
    setCreateMapOpen(false);
    push(localePath(`/maps/${map.id}`));
  };

  const contextValue = {
    openSearch,
    openCreateMap,
    appBarHidden,
    setAppBarHidden
  };

  return (
    <ShellContext.Provider value={contextValue}>
      {children}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreateMapDialog
        open={createMapOpen}
        onClose={() => setCreateMapOpen(false)}
        onSaved={handleCreatedMap}
      />
      <SignInRequiredDialog />
    </ShellContext.Provider>
  );
}
