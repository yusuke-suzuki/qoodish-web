'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useContext, useState } from 'react';
import type { AppMap } from '../../../types';
import AuthContext from '../../context/AuthContext';
import ShellContext from '../../context/ShellContext';
import SignInRequiredDialog from '../auth/SignInRequiredDialog';
import CreateMapDialog from '../maps/CreateMapDialog';
import SearchDialog from './SearchDialog';

type Props = {
  children: ReactNode;
};

export default function ShellProvider({ children }: Props) {
  const { push } = useRouter();
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMapOpen, setCreateMapOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openCreateMap = useCallback(() => {
    if (!authenticated) {
      setSignInRequired(true);
      return;
    }
    setCreateMapOpen(true);
  }, [authenticated, setSignInRequired]);

  const handleCreatedMap = useCallback(
    (map: AppMap) => {
      setCreateMapOpen(false);
      push(`/maps/${map.id}`);
    },
    [push]
  );

  return (
    <ShellContext.Provider value={{ openSearch, openCreateMap }}>
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
