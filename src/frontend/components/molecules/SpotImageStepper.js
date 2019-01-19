import React, { useState, useEffect } from 'react';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';
import SwipeableViews from 'react-swipeable-views';

const styles = {
  stepper: {
    background: '#ffffff'
  },
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 250
  }
};

const SpotImageStepper = props => {
  const [activeStep, setActiveStep] = useState(0);
  let maxSteps = props.spotReviews.length;

  useEffect(
    () => {
      setActiveStep(0);
    },
    [props.currentSpot]
  );

  return (
    <CardMedia>
      <SwipeableViews
        index={activeStep}
        onChangeIndex={step => setActiveStep(step)}
      >
        {props.spotReviews.map(review => (
          <img
            key={review.id}
            src={review.image ? review.image.url : process.env.SUBSTITUTE_URL}
            style={styles.spotImage}
            alt={review.spot.name}
          />
        ))}
      </SwipeableViews>
      <MobileStepper
        style={styles.stepper}
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </CardMedia>
  );
};

export default React.memo(SpotImageStepper);
