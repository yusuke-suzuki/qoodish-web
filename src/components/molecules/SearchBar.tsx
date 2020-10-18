import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import { fade, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import I18n from '../../utils/I18n';
import Link from 'next/link';

import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import searchMaps from '../../actions/searchMaps';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto'
    }
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 150,
      '&:focus': {
        width: 200
      }
    }
  },
  paper: {
    position: 'absolute'
  }
}));

const SearchBar = () => {
  const pickedMaps = useMappedState(
    useCallback(state => state.shared.pickedMaps, [])
  );
  const dispatch = useDispatch();
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback(
    async input => {
      if (input) {
        setListOpen(true);
      } else {
        setListOpen(false);
      }
      if (loading || !input) {
        return;
      }

      setLoading(true);

      const apiInstance = new MapsApi();
      const opts = {
        input: input
      };

      apiInstance.mapsGet(opts, (error, data, response) => {
        setLoading(false);
        if (response.ok) {
          dispatch(searchMaps(response.body));
        } else {
          console.log(error);
        }
      });
    },
    [dispatch, loading]
  );

  const classes = useStyles();

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder={I18n.t('search map')}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput
        }}
        type="search"
        onChange={e => handleInputChange(e.target.value)}
      />
      {listOpen && (
        <Paper className={classes.paper}>
          <List disablePadding>
            {pickedMaps.map(map => (
              <Link href="/profile" passHref key={map.id}>
                <ListItem button onClick={() => setListOpen(false)}>
                  <ListItemAvatar>
                    <Avatar alt={map.name} src={map.thumbnail_url} />
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography={true}
                    primary={
                      <Typography variant="subtitle1" noWrap>
                        {map.name}
                      </Typography>
                    }
                  />
                </ListItem>
              </Link>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
