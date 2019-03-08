import React, { useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';

import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import openSearchMapsDialog from '../../actions/openSearchMapsDialog';

const SearchButton = () => {
  const dispatch = useDispatch();
  const handleSearchButtonClick = useCallback(() => {
    dispatch(openSearchMapsDialog());
  });

  return (
    <IconButton color="inherit" onClick={handleSearchButtonClick}>
      <SearchIcon />
    </IconButton>
  );
};

export default React.memo(SearchButton);
