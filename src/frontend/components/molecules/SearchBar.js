import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import I18n from '../../utils/I18n';
import Link from './Link';

import { MapsApi } from 'qoodish_api';

import searchMaps from '../../actions/searchMaps';

const styles = theme => ({
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
      marginLeft: theme.spacing.unit,
      width: 'auto'
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
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
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
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
});

const SearchBar = props => {
  const pickedMaps = useMappedState(
    useCallback(state => state.shared.pickedMaps, [])
  );
  const dispatch = useDispatch();
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback(async input => {
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
  });

  const { classes } = props;

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
              <ListItem
                button
                component={Link}
                to={`/maps/${map.id}`}
                key={map.id}
                onClick={() => setListOpen(false)}
              >
                <ListItemAvatar>
                  <Avatar alt={map.name} src={map.thumbnail_url} />
                </ListItemAvatar>
                <ListItemText
                  primary={map.name}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default React.memo(withStyles(styles)(SearchBar));
