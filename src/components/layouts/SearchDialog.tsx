import { Search } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  InputAdornment,
  List,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useDeferredValue, useState } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useMapSearch } from '../../hooks/useMapSearch';
import AutocompleteListItem from '../common/AutocompleteListItem';
import NoContents from '../common/NoContents';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchDialog = ({ open, onClose }: Props) => {
  const dictionary = useDictionary();

  const { push } = useRouter();

  const [inputValue, setInputValue] = useState('');
  const deferredInputValue = useDeferredValue(inputValue);

  const { options } = useMapSearch(deferredInputValue);

  const handleMapClick = useCallback(
    (option: AppMap) => {
      onClose();
      push(`/maps/${option.id}`);
    },
    [onClose, push]
  );

  const handleExited = useCallback(() => {
    setInputValue('');
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        transition: {
          onExited: handleExited
        }
      }}
    >
      <AppBar color="transparent" position="relative" elevation={0}>
        <Toolbar>
          <TextField
            placeholder={dictionary['search map']}
            variant="standard"
            type="search"
            fullWidth
            autoFocus
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
            slotProps={{
              input: {
                margin: 'none',
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                )
              }
            }}
          />
        </Toolbar>
      </AppBar>
      <DialogContent dividers>
        {options.length > 0 && (
          <List
            disablePadding
            subheader={
              <Typography variant="subtitle1" color="text.secondary">
                {dictionary.maps}
              </Typography>
            }
          >
            {options.map((option) => (
              <AutocompleteListItem
                key={option.id}
                onClick={() => handleMapClick(option)}
                option={{ value: String(option.id), label: option.name }}
                inputValue={inputValue}
                avatar={<Avatar alt={option.name} src={option.thumbnail_url} />}
              />
            ))}
          </List>
        )}

        {options.length < 1 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <NoContents icon={Search} message={dictionary['map not found']} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(SearchDialog);
