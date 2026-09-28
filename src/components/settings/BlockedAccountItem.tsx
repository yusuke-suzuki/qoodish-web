'use client';

import {
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { BlockedAccount } from '../../../types/index.ts';
import useBlock from '../../hooks/useBlock.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';

type Props = {
  account: BlockedAccount;
  onUnblocked: (userId: number) => void;
};

function BlockedAccountItem({ account, onUnblocked }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { pending, unblock } = useBlock();

  const handleClick = async () => {
    const unblocked = await unblock(account.id);

    if (!unblocked) {
      return;
    }

    onUnblocked(account.id);
  };

  return (
    <ListItem
      disableGutters
      secondaryAction={
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          loading={pending}
          onClick={handleClick}
        >
          {dictionary.unblock}
        </Button>
      }
    >
      <ListItemAvatar>
        <AuthorAvatar author={account} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={localePath(`/users/${account.id}`)}
          >
            {account.name}
          </MuiLink>
        }
        slotProps={{ primary: { noWrap: true } }}
      />
    </ListItem>
  );
}

export default memo(BlockedAccountItem);
