import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

const CreateMapButton = (props) => {
  return (
    <IconButton
      color="inherit"
      onClick={() => props.handleButtonClick(props.currentUser)}
    >
      <AddIcon />
    </IconButton>
  );
};

export default CreateMapButton;
