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
import type { SearchResult } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { useSiteSearch } from '../../hooks/useSiteSearch.ts';
import { SEARCH_RESULT_GROUPS } from '../../utils/search.ts';

function TopBarSearch() {
  const dictionary = useDictionary();
  const { push } = useRouter();

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const deferredInputValue = useDeferredValue(inputValue);

  const { results, includesUsers, active, isLoading, failed } =
    useSiteSearch(deferredInputValue);

  const groupLabel = (option: SearchResult) => {
    const group = SEARCH_RESULT_GROUPS.find(({ type }) => type === option.type);

    return group ? dictionary[group.label] : '';
  };

  return (
    <Autocomplete
      fullWidth
      size="small"
      autoComplete
      includeInputInList
      open={open && active}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openOnFocus={false}
      clearOnBlur={false}
      handleHomeEndKeys={false}
      options={results}
      loading={isLoading}
      filterOptions={(candidates) => candidates}
      groupBy={groupLabel}
      getOptionLabel={(option: SearchResult) => option.name}
      getOptionKey={(option) => `${option.type}-${option.id}`}
      isOptionEqualToValue={(option, value) =>
        option.type === value.type && option.id === value.id
      }
      noOptionsText={
        failed ? dictionary['search failed'] : dictionary['no search results']
      }
      inputValue={inputValue}
      onInputChange={(_event, value) => setInputValue(value)}
      value={null}
      onChange={(_event, option) => {
        if (option) {
          push(option.href);
        }
      }}
      renderOption={({ key, ...props }, option) => (
        <Box key={key} component="li" {...props} sx={{ gap: 1.5 }}>
          <Avatar alt="" src={option.avatar} sx={{ width: 32, height: 32 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {option.name}
            </Typography>
            {option.detail && (
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
                noWrap
              >
                {option.detail}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          type="search"
          placeholder={
            includesUsers
              ? dictionary['search keyword']
              : dictionary['search keyword as guest']
          }
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
