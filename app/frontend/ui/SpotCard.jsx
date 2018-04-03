import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import RateReviewIcon from 'material-ui-icons/RateReview';
import DirectionsIcon from 'material-ui-icons/Directions';
import PlaceIcon from 'material-ui-icons/Place';
import CloseIcon from 'material-ui-icons/Close';
import Grid from 'material-ui/Grid';
import Slide from 'material-ui/transitions/Slide';

const styles = {
  rootLarge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1101,
    maxWidth: 700,
    margin: '0 auto'
  },
  rootSmall: {
    position: 'relative',
    bottom: 123,
    marginLeft: 15,
    marginRight: 15,
    zIndex: 1101
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  card: {
    height: 108
  },
  cardContainer: {
    display: 'inline-flex'
  },
  cardMedia: {
    width: 108,
    height: 108
  },
  cardContent: {
    position: 'absolute',
    left: 108,
    right: 0,
    paddingBottom: 0
  },
  spotName: {
    marginRight: 24,
    cursor: 'pointer'
  }
};

class SpotCard extends Component {
  render() {
    return (
      <Slide
        style={this.props.large ? styles.rootLarge : styles.rootSmall}
        direction="up"
        in={this.props.open}
        mountOnEnter
        unmountOnExit
      >
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </Slide>
    );
  }

  renderSpotCard(spot) {
    return (
      <Card style={styles.card}>
        <div style={styles.cardContainer}>
          <CardMedia image={spot.image_url} style={styles.cardMedia} />
          <CardContent style={styles.cardContent}>
            <IconButton
              onClick={this.props.handleCloseSpotButtonClick}
              style={styles.closeButton}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="subheading"
              noWrap
              style={styles.spotName}
              onClick={() => this.props.handleShowDetailButtonClick(spot)}
            >
              {spot.name}
            </Typography>
            <Typography color="textSecondary" noWrap>
              {spot.formatted_address}
            </Typography>
            <IconButton
              onClick={() => {
                let reviews = this.props.mapReviews.filter((review) => {
                  return review.place_id === spot.place_id;
                });
                this.props.handleShowReviewsButtonClick(reviews);
              }}
            >
              <RateReviewIcon />
            </IconButton>
            <IconButton
              onClick={() =>
                this.props.handleRouteButtonClick(
                  spot,
                  this.props.currentPosition
                )
              }
            >
              <DirectionsIcon />
            </IconButton>
          </CardContent>
        </div>
      </Card>
    );
  }
}

export default SpotCard;
