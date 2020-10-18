import {
  createStyles,
  Drawer,
  makeStyles,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { memo, useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import MapSummary from './MapSummary';

const useStyles = makeStyles(theme =>
  createStyles({
    drawerPaper: {
      height: '100%',
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        height: '100%',
        width: 'auto',
        zIndex: 1000
      }
    }
  })
);

const MapSummaryDrawer = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mapState = useCallback(
    state => ({
      mapSummaryOpen: state.mapDetail.mapSummaryOpen
    }),
    []
  );
  const { mapSummaryOpen } = useMappedState(mapState);

  const classes = useStyles();

  return (
    <Drawer
      variant={lgUp ? 'persistent' : 'temporary'}
      anchor={lgUp ? 'left' : 'right'}
      open={lgUp ? true : mapSummaryOpen}
      PaperProps={{
        className: classes.drawerPaper
      }}
    >
      <MapSummary />
    </Drawer>
  );
};

export default memo(MapSummaryDrawer);
