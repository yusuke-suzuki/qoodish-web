import React, { useState, useCallback, useContext } from 'react';
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

import I18n from '../../utils/I18n';

import openEditReviewDialog from '../../actions/openEditReviewDialog';
//import openCopyReviewDialog from '../../actions/openCopyReviewDialog';
import openDeleteReviewDialog from '../../actions/openDeleteReviewDialog';
import openIssueDialog from '../../actions/openIssueDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import AuthContext from '../../context/AuthContext';

const ReviewVertMenu = props => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentReview } = props;
  const { currentUser } = useContext(AuthContext);

  const dispatch = useDispatch();

  const handleEditMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openEditReviewDialog(currentReview));
  }, [dispatch, currentReview]);

  const handleDeleteMapButtonClick = useCallback(() => {
    setMenuOpen(false);
    dispatch(openDeleteReviewDialog(currentReview));
  }, [dispatch, currentReview]);

  // const handleCopyReviewButtonClick = useCallback(() => {
  //   setMenuOpen(false);
  //   dispatch(openCopyReviewDialog(currentReview));
  // }, [dispatch, currentReview]);

  const handleIssueButtonClick = useCallback(() => {
    setMenuOpen(false);
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else {
      dispatch(openIssueDialog(currentReview.id, 'review'));
    }
  }, [dispatch, currentUser, currentReview]);

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
        {currentReview && currentReview.editable ? (
          [
            <MenuItem key="edit" onClick={handleEditMapButtonClick}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={I18n.t('edit')} />
            </MenuItem>,
            // <MenuItem key="copy-review" onClick={handleCopyReviewButtonClick}>
            //   <ListItemIcon>
            //     <AddLocationIcon />
            //   </ListItemIcon>
            //   <ListItemText primary={I18n.t('copy')} />
            // </MenuItem>,
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
