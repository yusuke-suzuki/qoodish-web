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
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useMapPredictions } from '../../hooks/useMapPredictions';
import AutocompleteListItem from '../common/AutocompleteListItem';
import NoContents from '../common/NoContents';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchDialog = ({ open, onClose }: Props) => {
  const dictionary = useDictionary();

  const router = useRouter();

  const [requestInput, setRequestInput] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { options } = useMapPredictions(requestInput);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRequestInput(e.target.value);
    },
    []
  );

  const debouncedHandleChange = useMemo(
    () => debounce(handleChange, 500),
    [handleChange]
  );

  const handleMapClick = useCallback(
    (option: AppMap) => {
      onClose();
      router.push(`/maps/${option.id}`);
    },
    [onClose]
  );

  const handleExited = useCallback(() => {
    setRequestInput('');
    setInputValue('');
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{
        onExited: handleExited
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
            InputProps={{
              margin: 'none',
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              )
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              debouncedHandleChange(e);
            }}
            value={inputValue}
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
