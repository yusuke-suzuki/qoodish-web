'use client';

import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { muteUser, unmuteUser } from '../actions/mutes.ts';
import useDictionary from './useDictionary.ts';

export default function useMute() {
  const dictionary = useDictionary();
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const mute = async (userId: number) => {
    setPending(true);

    try {
      const result = await muteUser(userId);

      if (!result.success) {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });

        return false;
      }

      enqueueSnackbar(dictionary['account muted'], { variant: 'success' });
      router.refresh();

      return true;
    } catch {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });

      return false;
    } finally {
      setPending(false);
    }
  };

  const unmute = async (userId: number) => {
    setPending(true);

    try {
      const result = await unmuteUser(userId);

      if (!result.success) {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });

        return false;
      }

      enqueueSnackbar(dictionary['account unmuted'], { variant: 'success' });
      router.refresh();

      return true;
    } catch {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });

      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, mute, unmute };
}
