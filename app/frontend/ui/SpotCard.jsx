import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import RateReviewIcon from 'material-ui-icons/RateReview';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import DirectionsIcon from 'material-ui-icons/Directions';
import InfoIcon from 'material-ui-icons/Info';
import BottomNavigation, { BottomNavigationAction } from 'material-ui/BottomNavigation';
import PlaceIcon from 'material-ui-icons/Place';
import CloseIcon from 'material-ui-icons/Close';
import Grid from 'material-ui/Grid';

const styles = {
  rootLarge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1101,
    width: '50%',
    margin: '0 auto'
  },
  rootSmall: {
    position: 'fixed',
    bottom: 71,
    left: 15,
    right: 15,
    zIndex: 1101
  },
  closeButton: {
    position: 'absolute',
    right: 0
  },
  cardContent: {
    paddingBottom: 0
  },
  media: {
    width: '100%',
    height: '100%'
  },
  spotName: {
    marginRight: 20
  }
};

class SpotCard extends Component {
  render() {
    return (
      <div
        hidden={!this.props.open}
        style={this.props.large ? styles.rootLarge : styles.rootSmall}
      >
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </div>
    );
  }

  renderSpotCard(spot) {
    return (
      <Card>
        <IconButton
          onClick={this.props.handleCloseSpotButtonClick}
          style={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
        <Grid container spacing={0}>
          <Grid item xs={4} sm={3} md={3} lg={3}>
            <CardMedia
              image={spot.image_url}
              style={styles.media}
            />
          </Grid>
          <Grid item xs={8} sm={9} md={9} lg={9}>
            <CardContent style={styles.cardContent}>
              <Typography type='subheading' noWrap style={styles.spotName}>{spot.name}</Typography>
              <Typography color='textSecondary' noWrap>
                {spot.formatted_address}
              </Typography>
            </CardContent>
            <BottomNavigation showLabels={this.props.large ? true : false}>
              <BottomNavigationAction
                label='ADD'
                icon={<AddLocationIcon />}
                onClick={() => this.props.handleAddReviewButtonClick(spot)}
                disabled={this.props.currentMap && !this.props.currentMap.postable}
              />
              <BottomNavigationAction
                label='DIRECTIONS'
                icon={<DirectionsIcon />}
                onClick={() => this.props.handleRouteButtonClick(spot, this.props.currentPosition)}
              />
              <BottomNavigationAction
                label='DETAIL'
                icon={<InfoIcon />}
                onClick={() => this.props.handleShowDetailButtonClick(spot)}
              />
            </BottomNavigation>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

export default SpotCard;
