import React from 'react';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';
import I18n from '../containers/I18n';

const styles = {
  containerLarge: {
  },
  containerSmall: {
  },
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
  },
  description: {
    wordBreak: 'break-all'
  }
};

export default class MapSummaryCard extends React.PureComponent {
  render() {
    return this.renderCard(this.props.currentMap);
  }

  renderCard(map) {
    return (
      <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
        <CardMedia>
          {this.renderThumbnail(map)}
        </CardMedia>
        <CardContent>
          {map && map.name ? (
            <Typography
              variant="h5"
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
            <Typography
              component="p"
              style={styles.description}
            >
              {map.description}
            </Typography>
          ) : (
            <Chip style={styles.skeltonMapDescription} />
          )}
          <div style={styles.followMapButton}>
            <FollowMapButtonContainer currentMap={this.props.currentMap} />
          </div>
        </CardContent>
      </div>
    );
  }

  renderThumbnail(map) {
    return (
      <GridList cols={1} spacing={0} cellHeight={this.props.large ? 300 : 200}>
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
