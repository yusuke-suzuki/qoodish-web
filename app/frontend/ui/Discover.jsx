import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import LockIcon from 'material-ui-icons/Lock';
import ExploreIcon from 'material-ui-icons/Explore';
import PlaceIcon from 'material-ui-icons/Place';
import RateReviewIcon from 'material-ui-icons/RateReview';
import TrendingUpIcon from 'material-ui-icons/TrendingUp';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Typography from 'material-ui/Typography';
import Card, { CardHeader, CardContent } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import moment from 'moment';
import List, {
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from 'material-ui/List';

const styles = {
  rootLarge: {
    margin: '104px auto 200px',
    width: '80%'
  },
  rootSmall: {
    margin: '76px auto 64px'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20
  },
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  pickUpTile: {
    cursor: 'pointer',
    height: 330
  },
  pickUpTileBar: {
    height: '100%'
  },
  lockIcon: {
    marginRight: 10
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
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  mapTypeIcon: {
    marginLeft: 10,
    marginRight: 10
  },
  reviewCard: {
    margin: 3
  },
  profileImage: {
    width: 40
  },
  cardContentLarge: {
    paddingTop: 0,
    paddingRight: 120
  },
  cardContentSmall: {
    paddingTop: 0,
    paddingRight: 112
  },
  reviewImage: {
    width: '100%'
  },
  trendingSpotsList: {
    width: '100%'
  },
  secondaryAvatarLarge: {
    borderRadius: 0,
    marginRight: 24,
    width: 80,
    height: 80
  },
  secondaryAvatarSmall: {
    borderRadius: 0,
    marginRight: 16,
    width: 80,
    height: 80
  }
};

export default class Discover extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
    this.props.pickUpMap();
    this.props.fetchTrendingSpots();
    this.props.fetchRecentReviews();
    this.props.refreshPopularMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/discover',
      'page_title': 'Discover | Qoodish'
    });
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <ExploreIcon style={styles.mapTypeIcon} /> Pick Up
          </Typography>
          <br />
          {this.renderPickUp(this.props.mapPickedUp)}
        </div>
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <PlaceIcon style={styles.mapTypeIcon} /> Trending Spots
          </Typography>
          <br />
          {this.props.loadingTrendingSpots
            ? this.renderProgress()
            : this.renderTrendingSpotsContainer(this.props.trendingSpots)}
        </div>
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <RateReviewIcon style={styles.mapTypeIcon} /> Recent Reports
          </Typography>
          <br />
          {this.props.loadingRecentReviews
            ? this.renderProgress()
            : this.renderRecentReviewContainer(this.props.recentReviews)}
        </div>
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <TrendingUpIcon style={styles.mapTypeIcon} /> Trending Maps
          </Typography>
          {this.props.loadingPopularMaps
            ? this.renderProgress()
            : this.renderMapContainer(this.props.popularMaps)}
        </div>
      </div>
    );
  }

  renderPickUp(map) {
    return (
      <GridList cols={1} style={styles.gridList} spacing={20}>
        <GridListTile
          key={map && map.id}
          onClick={() => this.props.handleClickMap(map)}
          style={styles.pickUpTile}
        >
          <img src={map && map.image_url} />
          <GridListTileBar
            title={
              <Typography
                variant={this.props.large ? 'display3' : 'display2'}
                color="inherit"
                noWrap
                gutterBottom
              >
                {map && map.name}
              </Typography>
            }
            subtitle={
              <Typography
                variant={this.props.large ? 'display1' : 'headline'}
                color="inherit"
                noWrap
              >
                <span>{map && `by: ${map.owner_name}`}</span>
              </Typography>
            }
            style={styles.pickUpTileBar}
          />
        </GridListTile>
      </GridList>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noContentsContainer}>
        <MapIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          No maps.
        </Typography>
      </div>
    );
  }

  renderNoReviews() {
    return (
      <div style={styles.noContentsContainer}>
        <RateReviewIcon style={styles.noContentsIcon} />
        <Typography variant="subheading" color="inherit">
          No reports.
        </Typography>
      </div>
    );
  }

  renderTrendingSpotsContainer(spots) {
    return (
      <List disablePadding style={styles.trendingSpotsList}>
        {this.props.trendingSpots.length > 0
          ? this.renderSpots(this.props.trendingSpots)
          : null}
      </List>
    );
  }

  renderSpots(spots) {
    return spots.map((spot, i) => (
      <ListItem
        button
        key={spot.place_id}
        onClick={() => this.props.handleSpotClick(spot)}
      >
        <Avatar src={spot.image_url} />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subheading" noWrap>
              {i + 1}. {spot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {spot.formatted_address}
            </Typography>
          }
        />
      </ListItem>
    ));
  }

  renderRecentReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 2 : 1}
          style={styles.gridList}
          spacing={20}
          cellHeight={190}
        >
          {this.renderRecentReviews(reviews)}
        </GridList>
      );
    } else {
      return this.renderNoReviews();
    }
  }

  renderRecentReviews(reviews) {
    return reviews.map(review => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleClickReview(review)}
        style={styles.gridTile}
      >
        <Card style={styles.reviewCard}>
          <CardHeader
            avatar={
              <Avatar>
                <img
                  src={review.author.profile_image_url}
                  alt={review.author.name}
                  style={styles.profileImage}
                />
              </Avatar>
            }
            title={review.author.name}
            subheader={moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
              .locale(window.currentLocale)
              .fromNow()}
          />
          <CardContent style={this.props.large ? styles.cardContentLarge : styles.cardContentSmall}>
            <Typography
              variant="subheading"
              color="primary"
              gutterBottom
              noWrap
            >
              {review.map_name}
            </Typography>
            <Typography variant="title" gutterBottom noWrap>
              {review.spot.name}
            </Typography>
            <Typography component="p" noWrap>
              {review.comment}
            </Typography>
          </CardContent>
        </Card>
        {review.image && (
          <ListItemSecondaryAction>
            <Avatar
              src={review.image.thumbnail_url}
              style={this.props.large ? styles.secondaryAvatarLarge : styles.secondaryAvatarSmall}
            />
          </ListItemSecondaryAction>
        )}
      </GridListTile>
    ));
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 2}
          style={styles.gridList}
          spacing={this.props.large ? 20 : 10}
        >
          {this.renderMaps(maps)}
        </GridList>
      );
    } else {
      return this.renderNoMaps();
    }
  }

  renderMaps(maps) {
    return maps.map(map => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={<span>by: {map.owner_name}</span>}
          actionIcon={
            map.private ? (
              <LockIcon
                color="rgba(255, 255, 255, 0.54)"
                style={styles.lockIcon}
              />
            ) : null
          }
        />
      </GridListTile>
    ));
  }
}
