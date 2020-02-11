import React, { useEffect, useState } from 'react';

import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';

const styles = {
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
};

const ReviewImagePreview = props => {
  const { id, image, onImageRemoved } = props;

  useEffect(() => {
    const canvas = document.getElementById(id);

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
    <div style={styles.imagePreviewContainer}>
      <IconButton style={styles.clearImageIcon} onClick={onImageRemoved}>
        <CancelIcon />
      </IconButton>

      <canvas id={id} style={styles.imagePreview} />
    </div>
  );
};

export default React.memo(ReviewImagePreview);
