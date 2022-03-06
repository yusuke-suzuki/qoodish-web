import { memo, useCallback, useMemo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import I18n from '../../utils/I18n';
import MapShareMenu from './MapShareMenu';
import MapVertMenu from './MapVertMenu';
import MapLikeActions from './MapLikeActions';
import openInviteTargetDialog from '../../actions/openInviteTargetDialog';
import BackButton from './BackButton';
import {
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { Lock, PersonAdd } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbarActions: {
      marginLeft: 'auto',
      display: 'flex'
    },
    mapMenuIcon: {
      color: 'white'
    },
    mapName: {
      cursor: 'pointer'
    },
    mapTypeIcon: {
      marginRight: theme.spacing(1)
    },
    backButton: {
      marginRight: theme.spacing(2)
    }
  })
);

export default memo(function MapToolbar() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      map: state.mapSummary.currentMap
    }),
    []
  );
  const { map } = useMappedState(mapState);

  const handleInviteButtonClick = useCallback(() => {
    dispatch(openInviteTargetDialog());
  }, [dispatch]);

  const isInvitable = useMemo(() => {
    return map && (map.editable || (map.following && map.invitable));
  }, [map]);

  const isPrivate = useMemo(() => {
    return map && map.private;
  }, [map]);

  const isEditable = useMemo(() => {
    return map && map.editable;
  }, [map]);

  return (
    <Toolbar>
      <div className={classes.backButton}>
        <BackButton />
      </div>
      {isPrivate && (
        <Tooltip title={I18n.t('this map is private')}>
          <Lock
            color="inherit"
            className={classes.mapTypeIcon}
            fontSize="small"
          />
        </Tooltip>
      )}
      <Typography
        variant={smUp ? 'h6' : 'subtitle1'}
        color="inherit"
        noWrap
        className={classes.mapName}
      >
        {map && map.name}
      </Typography>
      <div className={classes.toolbarActions}>
        {isInvitable && (
          <Tooltip title={I18n.t('button invite')}>
            <IconButton color="inherit" onClick={handleInviteButtonClick}>
              <PersonAdd />
            </IconButton>
          </Tooltip>
        )}

        <MapShareMenu />

        {isEditable ? <MapVertMenu /> : <MapLikeActions target={map} />}
      </div>
    </Toolbar>
  );
});
