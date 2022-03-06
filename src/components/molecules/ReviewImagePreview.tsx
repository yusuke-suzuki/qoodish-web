import React, { useEffect } from 'react';

import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    imagePreviewContainer: {
      position: 'relative'
    },
    imagePreview: {
      width: '100%',
      objectFit: 'cover',
      height: 150
    },
    clearImageIcon: {
      position: 'absolute',
      right: 0
    }
  })
);

const ReviewImagePreview = props => {
  const { id, image, onImageRemoved } = props;
  const classes = useStyles();

  useEffect(() => {
    const canvas: any = document.getElementById(id);

    if (!canvas) {
      return;
    }

    if (canvas.getContext) {
      const context = canvas.getContext('2d');

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
      };
    }
  }, [image]);

  return (
    <div className={classes.imagePreviewContainer}>
      <IconButton className={classes.clearImageIcon} onClick={onImageRemoved}>
        <CancelIcon />
      </IconButton>

      <canvas id={id} className={classes.imagePreview} />
    </div>
  );
};

export default React.memo(ReviewImagePreview);
