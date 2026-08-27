import { Close, Search } from '@mui/icons-material';
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
import { memo, useDeferredValue, useState } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import { useMapSearch } from '../../hooks/useMapSearch.ts';
import AutocompleteListItem from '../common/AutocompleteListItem.tsx';
import NoContents from '../common/NoContents.tsx';
import SlideUpTransition from '../common/SlideUpTransition.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchDialog = ({ open, onClose }: Props) => {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { push } = useRouter();

  const [inputValue, setInputValue] = useState('');
  const deferredInputValue = useDeferredValue(inputValue);

  const { options } = useMapSearch(deferredInputValue);

  const handleMapClick = (option: AppMap) => {
    onClose();
    push(localePath(`/maps/${option.id}`));
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

          <IconButton
            edge="end"
            onClick={onClose}
            aria-label={dictionary.close}
          >
            <Close />
          </IconButton>
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
                avatar={<Avatar alt={option.name} src={option.image?.avatar} />}
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
