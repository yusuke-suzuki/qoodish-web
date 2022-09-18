import { memo, useCallback, useMemo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import MapShareMenu from './MapShareMenu';
import MapVertMenu from './MapVertMenu';
import MapLikeActions from './MapLikeActions';
import openInviteTargetDialog from '../../actions/openInviteTargetDialog';
import BackButton from './BackButton';
import {
  Box,
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
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbarActions: {
      marginLeft: 'auto',
      display: 'flex'
    },
    mapMenuIcon: {
      color: 'white'
    },
    mapTypeIcon: {
      marginRight: theme.spacing(1)
    },
    backButton: {
      marginRight: theme.spacing(1)
    }
  })
);

export default memo(function MapToolbar() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();
  const { I18n } = useLocale();

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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box display="flex" alignItems="center">
          <Box className={classes.backButton}>
            <BackButton />
          </Box>
          <Box display="flex" alignItems="center">
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
            >
              {map && map.name}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          {isInvitable && (
            <Tooltip title={I18n.t('button invite')}>
              <IconButton color="inherit" onClick={handleInviteButtonClick}>
                <PersonAdd />
              </IconButton>
            </Tooltip>
          )}

          {map && <MapShareMenu map={map} />}

          {isEditable ? <MapVertMenu /> : <MapLikeActions target={map} />}
        </Box>
      </Box>
    </Toolbar>
  );
});
