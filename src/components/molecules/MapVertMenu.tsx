import { useState, useCallback, memo } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import I18n from '../../utils/I18n';
import openEditMapDialog from '../../actions/openEditMapDialog';
import openDeleteMapDialog from '../../actions/openDeleteMapDialog';
import {
  createStyles,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem
} from '@material-ui/core';
import { Delete, Edit, MoreVert } from '@material-ui/icons';

const useStyles = makeStyles(() =>
  createStyles({
    mapMenuIcon: {
      color: 'white'
    }
  })
);

export default memo(function MapVertMenu() {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      map: state.mapSummary.currentMap
    }),
    []
  );
  const { map } = useMappedState(mapState);

  const dispatch = useDispatch();

  const handleEditMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openEditMapDialog(map));
  }, [dispatch, map]);

  const handleDeleteMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openDeleteMapDialog(map));
  }, [dispatch, map]);

  return (
    <>
      <IconButton
        aria-label="More vert"
        aria-owns={menuOpen ? 'vert-menu' : null}
        aria-haspopup="true"
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMenuOpen(true);
        }}
        edge="end"
      >
        <MoreVert className={classes.mapMenuIcon} />
      </IconButton>

      <Menu
        id="vert-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        {map && [
          <MenuItem key="edit" onClick={handleEditMapButtonClick}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary={I18n.t('edit')} />
          </MenuItem>,
          <MenuItem key="delete" onClick={handleDeleteMapButtonClick}>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary={I18n.t('delete')} />
          </MenuItem>
        ]}
      </Menu>
    </>
  );
});
