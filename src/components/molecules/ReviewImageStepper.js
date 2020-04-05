import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MobileStepper from '@material-ui/core/MobileStepper';
import Fab from '@material-ui/core/Fab';
import CardMedia from '@material-ui/core/CardMedia';
import SwipeableViews from 'react-swipeable-views';
import ButtonBase from '@material-ui/core/ButtonBase';

import openImageDialog from '../../actions/openImageDialog';

const styles = {
  cardMedia: {
    position: 'relative'
  },
  stepper: {
    background: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 0
  },
  stepButtonLeft: {
    position: 'absolute',
    zIndex: 1,
    top: '50%',
    left: 12,
    transform: 'translateY(-50%)'
  },
  stepButtonRight: {
    position: 'absolute',
    zIndex: 1,
    top: '50%',
    right: 12,
    transform: 'translateY(-50%)'
  },
  reviewImage: {
    width: '100%'
  }
};

const ReviewImageStepper = props => {
  const { review } = props;
  const large = useMediaQuery('(min-width: 600px)');
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = review.images.length;

  const dispatch = useDispatch();

  const handleImageClick = useCallback(image => {
    dispatch(openImageDialog(image.url));
  });

  useEffect(() => {
    setActiveStep(0);
  }, [review]);

  return (
    <div>
      <CardMedia style={styles.cardMedia}>
        {large && maxSteps > 1 && (
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
            style={styles.stepButtonLeft}
          >
            <KeyboardArrowLeft style={styles.icon} fontSize="large" />
          </Fab>
        )}
        <SwipeableViews
          index={activeStep}
          onChangeIndex={step => setActiveStep(step)}
        >
          {review.images.map(image => (
            <ButtonBase onClick={() => handleImageClick(image)} key={image.id}>
              <img
                src={image.thumbnail_url_800}
                style={styles.reviewImage}
                alt={review.spot.name}
                loading="lazy"
              />
            </ButtonBase>
          ))}
        </SwipeableViews>
        {large && maxSteps > 1 && (
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === maxSteps - 1}
            style={styles.stepButtonRight}
          >
            <KeyboardArrowRight style={styles.icon} fontSize="large" />
          </Fab>
        )}
      </CardMedia>
      <MobileStepper
        style={styles.stepper}
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
      />
    </div>
  );
};

export default React.memo(ReviewImageStepper);
