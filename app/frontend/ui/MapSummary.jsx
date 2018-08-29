import React from 'react';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import PlaceIcon from '@material-ui/icons/Place';
import TimelineIcon from '@material-ui/icons/Timeline';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Chip from '@material-ui/core/Chip';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';
import Tooltip from '@material-ui/core/Tooltip';

import MapToolbarContainer from '../containers/MapToolbarContainer';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';
import MapReviewsListContainer from '../containers/MapReviewsListContainer';
import MapSpotsListContainer from '../containers/MapSpotsListContainer';
import MapFollowersListContainer from '../containers/MapFollowersListContainer';
import SwipeableViews from 'react-swipeable-views';
import I18n from '../containers/I18n';

const styles = {
  skeltonThumbnail: {
    height: '100%'
  },
  skeltonThumbnailDisable: {
    height: 0
  },
  skeltonMapName: {
    width: '100%',
    height: '1.5rem'
  },
  skeltonMapDescription: {
    width: '70%',
    height: '0.875rem'
  },
  cardContainerLarge: {
    position: 'absolute',
    top: 64,
    bottom: 0,
    width: 380,
    zIndex: 1
  },
  cardContainerSmall: {
    paddingTop: 0,
    paddingBottom: 0
  },
  cardLarge: {
    height: '100%',
    overflowY: 'scroll',
    minHeight: 'calc(100vh - 64px)'
  },
  cardSmall: {
    height: '100%',
    position: 'absolute',
    width: '100%',
    overflowY: 'scroll',
    minHeight: '100%'
  },
  cardContentSmall: {
    textAlign: 'center'
  },
  tab: {
    minWidth: 0,
    width: 110
  },
  mapTypeIcon: {
    marginLeft: 8
  },
  mapTypeContainer: {
    verticalAlign: 'middle'
  },
  followMapButton: {
    marginTop: 16
  },
  mapName: {
    wordBreak: 'break-all'
  }
};

class MapSummary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleSwipeChange = this.handleSwipeChange.bind(this);
  }

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  handleSwipeChange(value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return <div>{this.renderMapSummary(this.props.currentMap)}</div>;
  }

  renderMapSummary(map) {
    return (
      <div
        style={
          this.props.large
            ? styles.cardContainerLarge
            : styles.cardContainerSmall
        }
      >
        <MapToolbarContainer skelton showCloseButton={this.props.dialogMode} />
        <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
          <CardMedia>
            {this.renderThumbnail(map)}
          </CardMedia>
          <CardContent style={this.props.large ? {} : styles.cardContentSmall}>
            {map && map.name ? (
              <Typography
                variant="headline"
                component="h2"
                gutterBottom
                style={styles.mapName}
              >
                {map.name} <span style={styles.mapTypeContainer}>{map.private && this.renderPrivateIcon()}</span>
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapName} />
            )}
            {map && map.description ? (
              <Typography component="p">
                {map.description}
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapDescription} />
            )}
            <div style={styles.followMapButton}>
              <FollowMapButtonContainer currentMap={this.props.currentMap} />
            </div>
          </CardContent>
          <Divider />
          {this.renderTabs()}
          {this.renderTabContents()}
        </Card>
      </div>
    );
  }

  renderTabs() {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        fullWidth
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<TimelineIcon />} label={I18n.t('timeline')} style={styles.tab} />
        <Tab icon={<PlaceIcon />} label={I18n.t('spots')} style={styles.tab} />
        <Tab icon={<GroupIcon />} label={I18n.t('followers')} style={styles.tab} />
      </Tabs>
    );
  }

  renderTabContents() {
    return (
      <SwipeableViews
        index={this.state.tabValue}
        onChangeIndex={this.handleSwipeChange}
        animateHeight
      >
        <MapReviewsListContainer mapId={this.props.mapId} />
        <MapSpotsListContainer />
        <MapFollowersListContainer mapId={this.props.mapId} />
      </SwipeableViews>
    );
  }

  renderThumbnail(map) {
    return (
      <GridList cols={1} spacing={0} cellHeight={this.props.large ? 380 : 250}>
        <GridListTile key={map && map.id}>
          <img
            src={map && map.image_url ? map.image_url : ''}
            alt={map && map.name}
          />
          <GridListTileBar
            style={
              map && map.image_url
                ? styles.skeltonThumbnailDisable
                : styles.skeltonThumbnail
            }
          />
        </GridListTile>
      </GridList>
    );
  }

  renderPrivateIcon() {
    return (
      <Tooltip title={I18n.t('this map is private')} key="private">
        <LockIcon color="inherit" style={styles.mapTypeIcon} />
      </Tooltip>
    );
  }
}

export default MapSummary;
