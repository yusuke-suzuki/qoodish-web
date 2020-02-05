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
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import AddLocationIcon from '@material-ui/icons/AddLocation';

import I18n from '../../utils/I18n';

import openEditReviewDialog from '../../actions/openEditReviewDialog';
import openCopyReviewDialog from '../../actions/openCopyReviewDialog';
import openDeleteReviewDialog from '../../actions/openDeleteReviewDialog';
import openIssueDialog from '../../actions/openIssueDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';

const ReviewVertMenu = props => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  const review = props.currentReview;
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );

  const dispatch = useDispatch();

  const handleEditMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openEditReviewDialog(review));
  });

  const handleDeleteMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openDeleteReviewDialog(review));
  });

  const handleCopyReviewButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openCopyReviewDialog(review));
  });

  const handleIssueButtonClick = useCallback(() => {
    setMenuOpen(false);
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else {
      dispatch(openIssueDialog(review.id, 'review'));
    }
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
        <MoreVertIcon />
      </IconButton>

      <Menu
        id="vert-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        {review && review.editable ? (
          [
            <MenuItem key="edit" onClick={handleEditMapButtonClick}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={I18n.t('edit')} />
            </MenuItem>,
            <MenuItem key="copy-review" onClick={handleCopyReviewButtonClick}>
              <ListItemIcon>
                <AddLocationIcon />
              </ListItemIcon>
              <ListItemText primary={I18n.t('copy')} />
            </MenuItem>,
            <MenuItem key="delete" onClick={handleDeleteMapButtonClick}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary={I18n.t('delete')} />
            </MenuItem>
          ]
        ) : (
          <MenuItem key="issue" onClick={handleIssueButtonClick}>
            <ListItemIcon>
              <ReportProblemIcon />
            </ListItemIcon>
            <ListItemText primary={I18n.t('report')} />
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default React.memo(ReviewVertMenu);
