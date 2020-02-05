import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import I18n from '../../utils/I18n';

import openEditMapDialog from '../../actions/openEditMapDialog';
import openDeleteMapDialog from '../../actions/openDeleteMapDialog';

const styles = {
  mapMenuIcon: {
    color: 'white'
  }
};

const MapVertMenu = () => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

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
  });

  const handleDeleteMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openDeleteMapDialog(map));
  });

  return (
    <div>
      <IconButton
        aria-label="More vert"
        aria-owns={menuOpen ? 'vert-menu' : null}
        aria-haspopup="true"
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMenuOpen(true);
        }}
      >
        <MoreVertIcon style={styles.mapMenuIcon} />
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
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={I18n.t('edit')} />
          </MenuItem>,
          <MenuItem key="delete" onClick={handleDeleteMapButtonClick}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={I18n.t('delete')} />
          </MenuItem>
        ]}
      </Menu>
    </div>
  );
};

export default React.memo(MapVertMenu);
