import React, { useCallback, useState } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';

import searchMaps from '../../actions/searchMaps';
import closeSearchMapsDialog from '../../actions/closeSearchMapsDialog';

import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      height: 56,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    paper: {
      marginTop: 56
    },
    dialogPaper: {
      background: '#f1f1f1'
    },
    input: {
      padding: 0
    },
    backButton: {
      marginRight: theme.spacing(1)
    }
  })
);

const SearchMapsDialog = () => {
  const { I18n } = useLocale();
  const classes = useStyles();
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      pickedMaps: state.shared.pickedMaps,
      dialogOpen: state.shared.searchMapsDialogOpen
    }),
    []
  );
  const { pickedMaps, dialogOpen } = useMappedState(mapState);

  const [loading, setLoading] = useState(false);

  const handleRequestClose = useCallback(() => {
    dispatch(closeSearchMapsDialog());
  }, [dispatch]);

  const handleInputChange = useCallback(
    async input => {
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

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestClose}
      fullScreen
      PaperProps={{
        className: classes.dialogPaper
      }}
    >
      <AppBar color="inherit">
        <Toolbar className={classes.toolbar}>
          <IconButton
            color="inherit"
            onClick={handleRequestClose}
            className={classes.backButton}
          >
            <ArrowBackIcon />
          </IconButton>
          <TextField
            onChange={e => handleInputChange(e.target.value)}
            fullWidth
            autoFocus
            type="search"
            placeholder={I18n.t('search map')}
            InputProps={{
              disableUnderline: true
            }}
            inputProps={{
              className: classes.input
            }}
          />
        </Toolbar>
      </AppBar>
      <Paper className={classes.paper}>
        <List disablePadding={pickedMaps.length < 1}>
          {pickedMaps.map(map => (
            <Link key={map.id} href={`/maps/${map.id}`} passHref>
              <ListItem button onClick={handleRequestClose}>
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
    </Dialog>
  );
};

export default React.memo(SearchMapsDialog);
