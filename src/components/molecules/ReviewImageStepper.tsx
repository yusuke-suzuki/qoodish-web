import React, { useState, useEffect } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MobileStepper from '@material-ui/core/MobileStepper';
import Fab from '@material-ui/core/Fab';
import CardMedia from '@material-ui/core/CardMedia';
import SwipeableViews from 'react-swipeable-views';
import ButtonBase from '@material-ui/core/ButtonBase';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardMedia: {
      position: 'relative'
    },
    stepper: {
      background: 'rgba(0, 0, 0, 0)',
      justifyContent: 'center',
      padding: theme.spacing(2),
      paddingBottom: 0
    },
    stepButtonLeft: {
      position: 'absolute',
      zIndex: 1,
      top: '50%',
      left: theme.spacing(2),
      transform: 'translateY(-50%)'
    },
    stepButtonRight: {
      position: 'absolute',
      zIndex: 1,
      top: '50%',
      right: theme.spacing(2),
      transform: 'translateY(-50%)'
    },
    reviewImage: {
      width: '100%'
    }
  })
);

const ReviewImageStepper = props => {
  const { review } = props;
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = review.images.length;
  const classes = useStyles();

  useEffect(() => {
    setActiveStep(0);
  }, [review]);

  return (
    <>
      <CardMedia className={classes.cardMedia}>
        {mdUp && maxSteps > 1 && (
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
            className={classes.stepButtonLeft}
          >
            <KeyboardArrowLeft fontSize="large" />
          </Fab>
        )}
        <SwipeableViews
          index={activeStep}
          onChangeIndex={step => setActiveStep(step)}
        >
          {review.images.map(image => (
            <ButtonBase
              key={image.id}
              href={image.url}
              target="_blank"
              rel="noopener"
            >
              <img
                src={image.thumbnail_url_800}
                className={classes.reviewImage}
                alt={review.spot.name}
                loading="lazy"
              />
            </ButtonBase>
          ))}
        </SwipeableViews>
        {mdUp && maxSteps > 1 && (
          <Fab
            size="small"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === maxSteps - 1}
            className={classes.stepButtonRight}
          >
            <KeyboardArrowRight fontSize="large" />
          </Fab>
        )}
      </CardMedia>
      <MobileStepper
        className={classes.stepper}
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        backButton={null}
        nextButton={null}
      />
    </>
  );
};

export default React.memo(ReviewImageStepper);
