'use client';

import {
  Autocomplete,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  memo,
  type SyntheticEvent,
  useCallback,
  useRef,
  useState,
  useTransition
} from 'react';
import type { AppMap, UserSearchResult } from '../../../types/index.ts';
import { inviteCoauthor, searchUsers } from '../../actions/coauthors.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  map: AppMap | null;
};

function CoauthorInviteDialog({ open, onClose, map }: Props) {
  const dictionary = useDictionary();

  const [options, setOptions] = useState<UserSearchResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (_event: SyntheticEvent, value: string) => {
      setInputValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const users = await searchUsers(value);
          setOptions(users);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  const handleInvite = useCallback(() => {
    if (!map || !selectedUser) {
      return;
    }

    startTransition(async () => {
      const result = await inviteCoauthor(map.id, selectedUser.id);

      if (result.success) {
        enqueueSnackbar(dictionary['send invitation success'], {
          variant: 'success'
        });
        setSelectedUser(null);
        setOptions([]);
        setInputValue('');
      } else {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
      }
    });
  }, [map, selectedUser, dictionary]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary.invite}
      disableClose={isPending}
      confirmAction={{
        label: dictionary.send,
        disabled: !selectedUser,
        loading: isPending,
        onClick: handleInvite
      }}
    >
      <Autocomplete
        autoComplete
        options={options}
        loading={loading}
        value={selectedUser}
        inputValue={inputValue}
        onChange={(_event, value) => setSelectedUser(value)}
        onInputChange={handleInputChange}
        filterOptions={(x) => x}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={dictionary['select invite target']}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <ListItem key={option.id} {...rest}>
              <ListItemAvatar>
                <Avatar
                  src={option.image?.avatar ?? option.image_url}
                  alt={option.name}
                />
              </ListItemAvatar>
              <ListItemText primary={option.name} />
            </ListItem>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder={dictionary['search users']}
            autoFocus
          />
        )}
      />
    </AppDialog>
  );
}

export default memo(CoauthorInviteDialog);
