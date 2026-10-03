'use client';

import { Button } from '@mui/material';
import Link from 'next/link';
import { closeSnackbar, enqueueSnackbar, type SnackbarKey } from 'notistack';
import { useContext, useEffect, useEffectEvent } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

const STORAGE_KEY = 'qoodish.termsRevisionAcknowledged.v1';

function loadAcknowledged(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

function snackbarKey(effectiveOn: string): string {
  return `terms-revision-${effectiveOn}`;
}

function saveAcknowledged(effectiveOn: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, effectiveOn);
  } catch (_error) {}
}

type Props = {
  effectiveOn: string | null;
};

export default function TermsRevisionNotice({ effectiveOn }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { authenticated } = useContext(AuthContext);

  const announce = useEffectEvent((pendingEffectiveOn: string) => {
    if (loadAcknowledged() === pendingEffectiveOn) return;

    const acknowledge = (snackbarId: SnackbarKey) => {
      saveAcknowledged(pendingEffectiveOn);
      closeSnackbar(snackbarId);
    };

    enqueueSnackbar(dictionary['terms revised'], {
      key: snackbarKey(pendingEffectiveOn),
      persist: true,
      action: (snackbarId) => (
        <>
          <Button
            component={Link}
            href={localePath('/terms')}
            onClick={() => acknowledge(snackbarId)}
          >
            {dictionary.review}
          </Button>
          <Button onClick={() => acknowledge(snackbarId)}>
            {dictionary.close}
          </Button>
        </>
      )
    });
  });

  useEffect(() => {
    if (!authenticated || !effectiveOn) return;

    announce(effectiveOn);

    return () => closeSnackbar(snackbarKey(effectiveOn));
  }, [authenticated, effectiveOn]);

  return null;
}
