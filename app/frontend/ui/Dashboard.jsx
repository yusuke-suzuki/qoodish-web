import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import MapIcon from 'material-ui-icons/Map';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import LockIcon from 'material-ui-icons/Lock';
import RateReviewIcon from 'material-ui-icons/RateReview';
import TrendingUpIcon from 'material-ui-icons/TrendingUp';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import CreateMapDialogContainer from '../containers/CreateMapDialogContainer.js';
import Typography from 'material-ui/Typography';
import Card, { CardHeader, CardMedia, CardContent} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import moment from 'moment';

const styles = {
  root: {
    margin: '104px auto 200px',
    width: '80%'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20
  },
  reviewGridList: {
    width: '100%'
  },
  mapGridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  lockIcon: {
    marginRight: 10
  },
  createButton: {
    position: 'fixed',
    zIndex: 2,
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
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
  reviewCardText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  profileImage: {
    width: 40
  },
  cardContent: {
    paddingTop: 0
  },
  cardMedia: {
    marginBottom: -5
  },
  reviewImage: {
    width: '100%'
  }
};

export default class Dashboard extends Component {
  componentWillMount() {
    this.props.fetchRecentReviews();
    this.props.refreshPopularMaps();
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
      <div style={styles.root}>
        <div style={styles.container}>
          <Typography type='subheading' gutterBottom color='secondary' style={styles.gridHeader}>
            <RateReviewIcon style={styles.mapTypeIcon} /> Recent reports
          </Typography>
          <br/>
          {this.props.loadingRecentReviews ? this.renderProgress() : this.renderRecentReviewContainer(this.props.recentReviews)}
        </div>
        <div style={styles.container}>
          <Typography type='subheading' gutterBottom color='secondary' style={styles.gridHeader}>
            <TrendingUpIcon style={styles.mapTypeIcon} /> Popular maps
          </Typography>
          {this.props.loadingPopularMaps ? this.renderProgress() : this.renderMapContainer(this.props.popularMaps)}
        </div>
        <Button
          fab
          aria-label='add'
          style={styles.createButton}
          onClick={this.props.handleCreateMapButtonClick}
        >
          <AddIcon />
        </Button>
        <CreateMapDialogContainer />
      </div>
    );
  }

  renderNoMaps() {
    return (
      <div style={styles.noContentsContainer}>
        <MapIcon style={styles.noContentsIcon} />
        <Typography type='subheading' color='inherit'>
          No maps.
        </Typography>
      </div>
    );
  }

  renderNoReviews() {
    return (
      <div style={styles.noContentsContainer}>
        <RateReviewIcon style={styles.noContentsIcon} />
        <Typography type='subheading' color='inherit'>
          No reports.
        </Typography>
      </div>
    );
  }

  renderRecentReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 1}
          style={styles.reviewGridList}
          spacing={20}
        >
          {this.renderRecentReviews(reviews)}
        </GridList>
      );
    } else {
      return this.renderNoReviews();
    }
  }

  renderRecentReviews(reviews) {
    return reviews.map((review) => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleClickReview(review)}
        style={styles.gridTile}
      >
        <Card>
          <CardHeader
            avatar={
              <Avatar>
                <img src={review.author.profile_image_url} alt={review.author.name} style={styles.profileImage} />
              </Avatar>
            }
            title={review.author.name}
            subheader={moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ').locale(window.currentLocale).fromNow()}
          />
          <CardContent style={styles.cardContent}>
            <Typography type='subheading' color='secondary' gutterBottom style={styles.reviewCardText}>
              {review.map_name}
            </Typography>
            <Typography type='headline' component='h2' gutterBottom style={styles.reviewCardText}>
              {review.spot.name}
            </Typography>
            <Typography component='p' style={styles.reviewCardText}>
              {review.comment}
            </Typography>
          </CardContent>
        </Card>
      </GridListTile>
    ));
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <GridList
          cols={this.props.large ? 4 : 1}
          style={styles.mapGridList}
          spacing={20}
        >
          {this.renderMaps(maps)}
        </GridList>
      );
    } else {
      return this.renderNoMaps();
    }
  }

  renderMaps(maps) {
    return maps.map((map) => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={
            <span>
              by: {map.owner_name}
            </span>
          }
          actionIcon={
            map.private ? <LockIcon color='rgba(255, 255, 255, 0.54)' style={styles.lockIcon} /> : null
          }
        />
      </GridListTile>
    ));
  }
}
