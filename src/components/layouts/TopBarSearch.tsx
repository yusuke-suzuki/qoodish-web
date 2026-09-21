'use client';

import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { memo, useDeferredValue, useState } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import { useMapSearch } from '../../hooks/useMapSearch.ts';

function TopBarSearch() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { push } = useRouter();

  const [inputValue, setInputValue] = useState('');
  const deferredInputValue = useDeferredValue(inputValue);

  const { options, isLoading, failed } = useMapSearch(deferredInputValue);

  return (
    <Autocomplete
      fullWidth
      size="small"
      autoComplete
      includeInputInList
      openOnFocus={false}
      clearOnBlur={false}
      handleHomeEndKeys={false}
      options={options}
      loading={isLoading}
      filterOptions={(candidates) => candidates}
      getOptionLabel={(option: AppMap) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={
        failed ? dictionary['search failed'] : dictionary['map not found']
      }
      inputValue={inputValue}
      onInputChange={(_event, value) => setInputValue(value)}
      value={null}
      onChange={(_event, option) => {
        if (option) {
          push(localePath(`/maps/${option.id}`));
        }
      }}
      renderOption={({ key, ...props }, option) => (
        <Box key={key} component="li" {...props} sx={{ gap: 1.5 }}>
          <Avatar
            alt=""
            src={option.image?.avatar}
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="body2" noWrap>
            {option.name}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          type="search"
          placeholder={dictionary['search map']}
          aria-label={dictionary.search}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              )
            }
          }}
        />
      )}
    />
  );
}

export default memo(TopBarSearch);
