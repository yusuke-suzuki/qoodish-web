import { ArrowBack, Close, Search, SearchOff } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  List,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { memo, useDeferredValue, useRef, useState } from 'react';
import type { SearchResult } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { useSiteSearch } from '../../hooks/useSiteSearch.ts';
import { SEARCH_RESULT_GROUPS } from '../../utils/search.ts';
import AutocompleteListItem from '../common/AutocompleteListItem.tsx';
import NoContents from '../common/NoContents.tsx';
import SlideUpTransition from '../common/SlideUpTransition.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchDialog = ({ open, onClose }: Props) => {
  const dictionary = useDictionary();
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { push } = useRouter();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredInputValue = useDeferredValue(inputValue);

  const { results, includesUsers, active, isLoading, failed } =
    useSiteSearch(deferredInputValue);

  const groups = SEARCH_RESULT_GROUPS.map((group) => ({
    ...group,
    results: results.filter((result) => result.type === group.type)
  })).filter((group) => group.results.length > 0);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    push(result.href);
  };

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleExited = () => {
    setInputValue('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullScreen={fullScreen}
      slots={fullScreen ? { transition: SlideUpTransition } : undefined}
      slotProps={{
        transition: {
          onExited: handleExited
        }
      }}
    >
      <AppBar color="transparent" position="relative" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onClose}
            aria-label={dictionary.close}
          >
            <ArrowBack />
          </IconButton>

          <TextField
            placeholder={
              includesUsers
                ? dictionary['search keyword']
                : dictionary['search keyword as guest']
            }
            variant="standard"
            fullWidth
            autoFocus
            inputRef={inputRef}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={inputValue}
            slotProps={{
              input: {
                margin: 'none',
                disableUnderline: true,
                endAdornment: inputValue && (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={handleClear}
                      aria-label={dictionary['clear search']}
                    >
                      <Close />
                    </IconButton>
                  </InputAdornment>
                )
              },
              htmlInput: {
                enterKeyHint: 'search'
              }
            }}
          />
        </Toolbar>
      </AppBar>
      <DialogContent dividers>
        {groups.map((group) => (
          <List
            key={group.type}
            disablePadding
            subheader={
              <Typography variant="subtitle1" color="text.secondary">
                {dictionary[group.label]}
              </Typography>
            }
          >
            {group.results.map((result) => (
              <AutocompleteListItem
                key={result.id}
                onClick={() => handleResultClick(result)}
                option={{ value: String(result.id), label: result.name }}
                inputValue={inputValue}
                secondary={result.detail}
                avatar={<Avatar alt={result.name} src={result.avatar} />}
              />
            ))}
          </List>
        ))}

        {active && !isLoading && results.length < 1 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <NoContents
              icon={failed ? SearchOff : Search}
              message={
                failed
                  ? dictionary['search failed']
                  : dictionary['no search results']
              }
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(SearchDialog);
