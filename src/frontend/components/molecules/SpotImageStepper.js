import React, { useState, useEffect } from 'react';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MobileStepper from '@material-ui/core/MobileStepper';
import Fab from '@material-ui/core/Fab';
import CardMedia from '@material-ui/core/CardMedia';
import SwipeableViews from 'react-swipeable-views';
import { Link } from '@yusuke-suzuki/rize-router';
import ButtonBase from '@material-ui/core/ButtonBase';

const styles = {
  swipeable: {
    height: 150
  },
  stepperContainer: {
    width: '100%',
    zIndex: 1,
    position: 'absolute',
    top: 125
  },
  stepper: {
    background: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center'
  },
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 150
  },
  stepButtonLeft: {
    position: 'absolute',
    zIndex: 1,
    top: 60,
    left: 12,
    width: 24,
    height: 24,
    minHeight: 'auto'
  },
  stepButtonRight: {
    position: 'absolute',
    zIndex: 1,
    top: 60,
    right: 12,
    width: 24,
    height: 24,
    minHeight: 'auto'
  },
  icon: {
    width: '0.7em',
    height: '0.7em'
  }
};

const SpotImageStepper = props => {
  const [activeStep, setActiveStep] = useState(0);
  let maxSteps = props.spotReviews.length;

  useEffect(() => {
    setActiveStep(0);
  }, [props.currentSpot]);

  return (
    <CardMedia>
      <SwipeableViews
        index={activeStep}
        onChangeIndex={step => setActiveStep(step)}
        style={styles.swipeable}
      >
        {props.spotReviews.map(review => (
          <ButtonBase
            key={review.id}
            component={Link}
            to={{
              pathname: `/maps/${review.map.id}/reports/${review.id}`,
              state: { modal: true, review: review }
            }}
          >
            <img
              src={
                review.image
                  ? review.image.thumbnail_url_400
                  : process.env.SUBSTITUTE_URL
              }
              style={styles.spotImage}
              alt={review.spot.name}
            />
          </ButtonBase>
        ))}
      </SwipeableViews>
      {maxSteps > 1 && (
        <React.Fragment>
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
            style={styles.stepButtonLeft}
          >
            <KeyboardArrowLeft style={styles.icon} />
          </Fab>
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === maxSteps - 1}
            style={styles.stepButtonRight}
          >
            <KeyboardArrowRight style={styles.icon} />
          </Fab>
          <div style={styles.stepperContainer}>
            <MobileStepper
              style={styles.stepper}
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
            />
          </div>
        </React.Fragment>
      )}
    </CardMedia>
  );
};

export default React.memo(SpotImageStepper);
