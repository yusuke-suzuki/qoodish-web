import React, { Component } from 'react';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import PlaceIcon from 'material-ui-icons/Place';
import PlaceSelectDialogContainer from '../containers/PlaceSelectDialogContainer';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import { CircularProgress } from 'material-ui/Progress';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import AddLocationIcon from 'material-ui-icons/AddLocation';
import ReviewDialogContainer from '../containers/ReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';

const styles = {
  mapWrapperLarge: {
    paddingTop: 64,
    height: 300
  },
  mapWrapperSmall: {
    paddingTop: 56,
    height: 200
  },
  mapContainer: {
    height: '100%'
  },
  container: {
    margin: '0 auto',
  },
  cardLarge: {
    minHeight: 'calc(100vh - 364px)'
  },
  cardSmall: {
    minHeight: 'calc(100vh - 200px)'
  },
  cardContentLarge: {
    width: '50%',
    margin: '0 auto',
    textAlign: 'center'
  },
  cardContentSmall: {
    textAlign: 'center'
  },
  listLarge: {
    width: '50%',
    margin: '0 auto'
  },
  listSmall: {
  },
  avatarImage: {
    width: 40,
    height: 40
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    marginTop: 4
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 20
  },
  noContentsIcon: {
    width: 150,
    height: 150
  },
  createButtonLarge: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  createButtonSmall: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 76,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  reviewComment: {
    marginRight: 20
  }
};

const mapOptions = {
  zoomControl: false,
  streetViewControl: false,
  scaleControl: false,
  mapTypeControl: false
};

const GoogleMapContainer = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    options={mapOptions}
    center={props.currentSpot && new google.maps.LatLng(parseFloat(props.currentSpot.lat), parseFloat(props.currentSpot.lng))}
  >
    <Marker
      position={props.currentSpot && new google.maps.LatLng(parseFloat(props.currentSpot.lat), parseFloat(props.currentSpot.lng))}
      defaultAnimation={2}
    />
  </GoogleMap>
));

class SpotDetail extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.currentSpot) {
      this.props.fetchSpot();
    }
    this.props.fetchSpotReviews();
  }

  componentWillUnmount() {
    this.props.clear();
  }

  render() {
    return (
      <div>
        {this.renderMap()}
        {this.renderContainer()}
        {this.props.currentSpot && this.renderCreateReviewButton(this.props.currentSpot)}
        <PlaceSelectDialogContainer />
        <EditReviewDialogContainer />
        <DeleteReviewDialogContainer />
        <ReviewDialogContainer />
      </div>
    );
  }

  renderMap() {
    return (
      <GoogleMapContainer
        {...this.props}
        containerElement={
          <div style={this.props.large ? styles.mapWrapperLarge : styles.mapWrapperSmall} />
        }
        mapElement={
          <div style={styles.mapContainer} />
        }
        loadingElement={
          <div style={{ height: '100%' }} />
        }
      />
    );
  }

  renderContainer() {
    return (
      <div style={styles.container}>
        {this.props.spotLoading ? this.renderProgress() : this.renderSpotDetail()}
      </div>
    );
  }

  renderSpotDetail() {
    if (this.props.currentSpot) {
      return this.renderSpotCard(this.props.currentSpot);
    } else {
      return this.renderNoContent();
    }
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderNoContent() {
    return (
      <div style={styles.noContentsContainer}>
        <PlaceIcon style={styles.noContentsIcon} />
        <Typography type='subheading' color='inherit'>
          Place not found.
        </Typography>
      </div>
    );
  }

  renderSpotCard(spot) {
    return (
      <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
        <CardContent style={this.props.large ? styles.cardContentLarge : styles.cardContentSmall}>
          <PlaceIcon />
          <Typography type='headline'>
            {spot.name}
          </Typography>
          <Typography type='subheading' color='textSecondary'>
            {spot.formatted_address}
          </Typography>
        </CardContent>
        <List
          style={this.props.large ? styles.listLarge : styles.listSmall}
        >
          {this.renderSpotReviews(this.props.spotReviews)}
        </List>
      </Card>
    );
  }

  renderSpotReviews(reviews) {
    return reviews.map((review) => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review, this.props.large)}
      >
        <Avatar>
          <img src={review.author.profile_image_url} style={styles.avatarImage} />
        </Avatar>
        <ListItemText
          disableTypography={true}
          primary={
            <Typography type='subheading' noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography component='p' noWrap color='textSecondary' style={styles.reviewComment}>
              {review.comment}
            </Typography>
          }
        />
        {review.image &&
          <ListItemSecondaryAction>
            <Avatar style={styles.secondaryAvatar}>
              <img src={review.image.url} style={styles.avatarImage} />
            </Avatar>
          </ListItemSecondaryAction>
        }
      </ListItem>
    ));
  }

  renderCreateReviewButton(spot) {
    return (
      <Button
        fab
        aria-label='add'
        style={this.props.large ? styles.createButtonLarge : styles.createButtonSmall}
        onClick={() => this.props.handleCreateReviewClick(spot)}
      >
        <AddLocationIcon />
      </Button>
    );
  }
}

export default SpotDetail;
