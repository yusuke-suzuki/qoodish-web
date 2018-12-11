import React from 'react';
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

class SpotImageStepper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0
    };
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentSpot.place_id !== this.props.currentSpot.place_id) {
      this.setState({
        activeStep: 0
      });
    }
  }

  handleNext() {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack() {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  handleStepChange(activeStep) {
    this.setState({ activeStep });
  };

  renderStepper() {
    let maxSteps = this.props.spotReviews.length;
    return (
      <MobileStepper
        style={styles.stepper}
        steps={maxSteps}
        position="static"
        activeStep={this.state.activeStep}
        nextButton={
          <Button size="small" onClick={this.handleNext} disabled={this.state.activeStep === maxSteps - 1}>
            Next
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={this.handleBack} disabled={this.state.activeStep === 0}>
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    );
  }

  render() {
    return (
      <CardMedia>
        <SwipeableViews
          index={this.state.activeStep}
          onChangeIndex={this.handleStepChange}
        >
          {this.props.spotReviews.map(review => (
            <img
              key={review.id}
              src={review.image ? review.image.url : process.env.SUBSTITUTE_URL}
              style={styles.spotImage}
              alt={review.spot.name}
            />
          ))}
        </SwipeableViews>
        {this.renderStepper()}
      </CardMedia>
    );
  }
};

export default SpotImageStepper;
