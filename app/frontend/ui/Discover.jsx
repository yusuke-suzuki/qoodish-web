import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExploreIcon from '@material-ui/icons/Explore';
import PlaceIcon from '@material-ui/icons/Place';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import GradeIcon from '@material-ui/icons/Grade';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';

import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import RecentReviewsContainer from '../containers/RecentReviewsContainer';
import CreateResourceButtonContainer from '../containers/CreateResourceButtonContainer';

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
  listContainerLarge: {
    display: 'flex'
  },
  listContainerSmall: {
  },
  rankingContainerLarge: {
    marginTop: 40,
    marginBottom: 20,
    width: '50%'
  },
  rankingContainerSmall: {
    marginTop: 40,
    marginBottom: 20
  },
  listItemLarge: {
    paddingLeft: 10,
    paddingRight: 64
  },
  listItemSmall: {
    paddingLeft: 10,
    paddingRight: 64
  },
  listItemSecondaryAction: {
    right: 10
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
  pickUpTileLarge: {
    height: 330
  },
  pickUpTileSmall: {
    height: 280
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
  }
};

export default class Discover extends React.PureComponent {
  componentDidMount() {
    this.props.pickUpMap();
    this.props.fetchTrendingSpots();
    this.props.fetchRecentReviews();
    this.props.refreshActiveMaps();
    this.props.refreshRecentMaps();
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
            variant="subtitle1"
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
            variant="subtitle1"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <FiberNewIcon style={styles.headerIcon} /> {I18n.t('recent reports')}
          </Typography>
          <br />
          <RecentReviewsContainer />
        </div>

        <div style={styles.mapsContainer}>
          <Typography
            variant="subtitle1"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <WhatshotIcon style={styles.headerIcon} /> {I18n.t('active maps')}
          </Typography>
          {this.props.loadingActiveMaps
            ? this.renderProgress()
            : this.renderMapContainer(this.props.activeMaps)}
        </div>

        <div style={styles.mapsContainer}>
          <Typography
            variant="subtitle1"
            gutterBottom
            color="textSecondary"
            style={styles.gridHeader}
          >
            <FiberNewIcon style={styles.headerIcon} /> {I18n.t('recent maps')}
          </Typography>
          {this.props.loadingRecentMaps
            ? this.renderProgress()
            : this.renderMapContainer(this.props.recentMaps)}
        </div>

        <div style={this.props.large ? styles.listContainerLarge : styles.listContainerSmall}>
          <div style={this.props.large ? styles.rankingContainerLarge : styles.rankingContainerSmall}>
            <Typography
              variant="subtitle1"
              gutterBottom
              color="textSecondary"
              style={styles.gridHeader}
            >
              <GradeIcon style={styles.headerIcon} /> {I18n.t('trending maps')}
            </Typography>
            <br />
            {this.props.loadingPopularMaps
              ? this.renderProgress()
              : this.renderTrendingMapsContainer(this.props.popularMaps)}
          </div>

          <div style={this.props.large ? styles.rankingContainerLarge : styles.rankingContainerSmall}>
            <Typography
              variant="subtitle1"
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
        {this.props.large && <CreateResourceButtonContainer />}
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
          style={this.props.large ? styles.pickUpTileLarge : styles.pickUpTileSmall}
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
                variant={this.props.large ? 'h2' : 'h4'}
                color="inherit"
                gutterBottom
                style={styles.pickUpText}
              >
                {map && map.name}
              </Typography>
            }
            subtitle={
              <Typography
                variant={this.props.large ? 'h4' : 'h5'}
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

  renderTrendingMapsContainer(maps) {
    return (
      <List disablePadding>
        {maps.length > 0
          ? this.renderTrendingMaps(maps)
          : null}
      </List>
    );
  }

  renderTrendingMaps(maps) {
    return maps.map((map, i) => (
      <ListItem
        button
        key={map.id}
        component={Link}
        to={`/maps/${map.id}`}
        title={map.name}
        style={this.props.large ? styles.listItemLarge : styles.listItemSmall}
      >
        <Avatar
          src={map.thumbnail_url}
          alt={map.name}
        />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subtitle1" noWrap>
              {i + 1}. {map.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {map.description}
            </Typography>
          }
        />
        <ListItemSecondaryAction style={styles.listItemSecondaryAction} >
          <Button
            size="small"
            component={Link}
            to={`/maps/${map.id}`}
            title={map.name}
            variant="outlined"
          >
            {I18n.t('detail')}
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
    ));
  }

  renderTrendingSpotsContainer(spots) {
    return (
      <List disablePadding style={styles.trendingList}>
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
        style={this.props.large ? styles.listItemLarge : styles.listItemSmall}
      >
        <Avatar
          src={spot.image_url}
          alt={spot.name}
        />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subtitle1" noWrap>
              {i + 1}. {spot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {spot.formatted_address}
            </Typography>
          }
        />
        <ListItemSecondaryAction style={styles.listItemSecondaryAction} >
          <Button
            size="small"
            component={Link}
            to={`/spots/${spot.place_id}`}
            title={spot.name}
            variant="outlined"
          >
            {I18n.t('detail')}
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
    ));
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <MapCollectionContainer maps={maps} horizontal={!this.props.large} />
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
