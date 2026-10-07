'use client';

import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { blockUser, unblockUser } from '../actions/blocks.ts';
import useDictionary from './useDictionary.ts';

export default function useBlock() {
  const dictionary = useDictionary();
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const block = async (userId: number) => {
    setPending(true);

    try {
      const result = await blockUser(userId);

      if (!result.success) {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });

        return false;
      }

      enqueueSnackbar(dictionary['account blocked'], { variant: 'success' });
      router.refresh();

      return true;
    } catch {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });

      return false;
    } finally {
      setPending(false);
    }
  };

  const unblock = async (userId: number) => {
    setPending(true);

    try {
      const result = await unblockUser(userId);

      if (!result.success) {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });

        return false;
      }

      enqueueSnackbar(dictionary['account unblocked'], { variant: 'success' });
      router.refresh();

      return true;
    } catch {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });

      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, block, unblock };
}
