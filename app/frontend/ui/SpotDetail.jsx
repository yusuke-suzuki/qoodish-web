import React, { Component } from 'react';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import PlaceIcon from 'material-ui-icons/Place';
import PlaceSelectDialogContainer from '../containers/PlaceSelectDialogContainer';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import { CircularProgress } from 'material-ui/Progress';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import AddLocationIcon from 'material-ui-icons/AddLocation';

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
  containerLarge: {
    margin: '0 auto 200px',
    width: '80%'
  },
  containerSmall: {
    margin: '0 auto 0'
  },
  cardContent: {
    textAlign: 'center',
    margin: '0 auto'
  },
  listLarge: {
    width: '50%',
    margin: '0 auto'
  },
  listSmall: {
    margin: '0 auto'
  },
  avatarImage: {
    width: 40,
    height: 40
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12
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
      <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
        {this.props.spotLoading ? this.renderProgress() : this.renderSpotDetail()}
        <List
          style={this.props.large ? styles.listLarge : styles.listSmall}
        >
          {this.renderSpotReviews(this.props.spotReviews)}
        </List>
      </div>
    );
  }

  renderSpotDetail() {
    if (this.props.currentSpot) {
      return this.renderCardContent(this.props.currentSpot);
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

  renderCardContent(spot) {
    return (
      <CardContent
        style={styles.cardContent}
      >
        <PlaceIcon />
        <Typography type='headline'>
          {spot.name}
        </Typography>
        <Typography type='subheading' color='textSecondary'>
          {spot.formatted_address}
        </Typography>
      </CardContent>
    );
  }

  renderSpotReviews(reviews) {
    return reviews.map((review) => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
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
            <Typography component='p' noWrap color='textSecondary'>
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
