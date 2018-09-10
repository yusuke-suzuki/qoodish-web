import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExploreIcon from '@material-ui/icons/Explore';
import PlaceIcon from '@material-ui/icons/Place';
import RateReviewIcon from '@material-ui/icons/RateReview';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import I18n from '../containers/I18n';

import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '94px auto 200px'
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
  mapsContainer: {
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
    height: 330
  },
  pickUpTileBar: {
    height: '100%'
  },
  pickUpText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  },
  headerIcon: {
    marginLeft: 10,
    marginRight: 10
  },
  reviewCard: {
    margin: 3
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

export default class Discover extends React.PureComponent {
  componentWillMount() {
    this.props.updatePageTitle();
    this.props.pickUpMap();
    this.props.fetchTrendingSpots();
    this.props.fetchRecentReviews();
    this.props.refreshPopularMaps();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/discover',
      'page_title': `${I18n.t('discover')} | Qoodish`
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
        {this.renderHelmet()}
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <ExploreIcon style={styles.headerIcon} /> {I18n.t('pick up')}
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
            <RateReviewIcon style={styles.headerIcon} /> {I18n.t('recent reports')}
          </Typography>
          <br />
          {this.props.loadingRecentReviews
            ? this.renderProgress()
            : this.renderRecentReviewContainer(this.props.recentReviews)}
        </div>
        <div style={styles.mapsContainer}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <TrendingUpIcon style={styles.headerIcon} /> {I18n.t('trending maps')}
          </Typography>
          {this.props.loadingPopularMaps
            ? this.renderProgress()
            : this.renderMapContainer(this.props.popularMaps)}
        </div>
        <div style={styles.container}>
          <Typography
            variant="subheading"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <PlaceIcon style={styles.headerIcon} /> {I18n.t('trending spots')}
          </Typography>
          <br />
          {this.props.loadingTrendingSpots
            ? this.renderProgress()
            : this.renderTrendingSpotsContainer(this.props.trendingSpots)}
        </div>
      </div>
    );
  }

  renderHelmet() {
    return (
      <Helmet
        title={`${I18n.t('discover')} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/discover` }
        ]}
        meta={[
          { name: 'title', content: `${I18n.t('discover')} | Qoodish` },
          { property: 'og:title', content: `${I18n.t('discover')} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/discover`
          }
        ]}
      />
    );
  }

  renderPickUp(map) {
    return (
      <GridList cols={1} style={styles.gridList} spacing={20}>
        <GridListTile
          key={map && map.id}
          onClick={() => this.props.handleClickMap(map)}
          style={styles.pickUpTile}
          component={Link}
          to={`/maps/${map && map.id}`}
          title={map && map.name}
        >
          <img
            src={map && map.image_url}
            alt={map && map.name}
          />
          <GridListTileBar
            title={
              <Typography
                variant={this.props.large ? 'display3' : 'display1'}
                color="inherit"
                gutterBottom
                style={styles.pickUpText}
              >
                {map && map.name}
              </Typography>
            }
            subtitle={
              <Typography
                variant={this.props.large ? 'display1' : 'headline'}
                color="inherit"
                style={styles.pickUpText}
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

  renderTrendingSpotsContainer(spots) {
    return (
      <List disablePadding style={styles.trendingSpotsList}>
        {spots.length > 0
          ? this.renderSpots(spots)
          : null}
      </List>
    );
  }

  renderSpots(spots) {
    return spots.map((spot, i) => (
      <ListItem
        button
        key={spot.place_id}
        component={Link}
        to={`/spots/${spot.place_id}`}
        title={spot.name}
      >
        <Avatar
          src={spot.image_url}
          alt={spot.name}
        />
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
      return (
        <NoContentsContainer
          contentType="review"
          message={I18n.t('reports will see here')}
        />
      );
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
              <Avatar
                src={review.author.profile_image_url}
                alt={review.author.name}
              />
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
              {review.map.name}
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
              alt={review.spot.name}
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
        <MapCollectionContainer maps={maps} />
      );
    } else {
      return (
        <NoContentsContainer
          contentType="map"
          message={I18n.t('maps will see here')}
        />
      );
    }
  }
}
