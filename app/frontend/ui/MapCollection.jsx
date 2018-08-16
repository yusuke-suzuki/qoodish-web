import React from 'react';
import LockIcon from '@material-ui/icons/Lock';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  },
  tileBar: {
    height: 90
  },
  followCheckButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
    border: '1px solid #ffc107'
  },
  mapTypeIcon: {
    marginLeft: 16,
    marginRight: 16,
    color: '#fff',
    fontSize: '1.2rem'
  },
  mapTypeContainer: {
    display: 'grid'
  }
};

export default class MapCollection extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <GridList
          cols={this.props.large ? 4 : 2}
          style={styles.gridList}
          spacing={this.props.large ? 20 : 10}
          cellHeight={220}
        >
          {this.renderMaps(this.props.maps)}
        </GridList>
      </div>
    );
  }

  renderMaps(maps) {
    return maps.map(map => (
      <GridListTile
        key={map.id}
        onClick={() => this.props.handleClickMap(map)}
        component={Link}
        to={`/maps/${map.id}`}
      >
        {map.following && this.renderFollowCheckButton() }
        <img src={this.props.large ? map.image_url : map.thumbnail_url} />
        <GridListTileBar
          title={map.name}
          subtitle={
            <div>
              <Typography
                variant="body2"
                color="inherit"
                noWrap
              >
                by: {map.owner_name}
              </Typography>
              <Typography
                variant="body2"
                color="inherit"
                noWrap
              >
                {map.followers_count} {I18n.t('followers')}
              </Typography>
            </div>
          }
          actionIcon={
            <div style={styles.mapTypeContainer}>
              {map.private && this.renderPrivateIcon()}
            </div>
          }
          style={styles.tileBar}
        />
      </GridListTile>
    ));
  }

  renderFollowCheckButton() {
    return (
      <Button variant="outlined" size="small" color="primary" style={styles.followCheckButton}>
        {I18n.t('following')}
      </Button>
    );
  }

  renderPrivateIcon() {
    return (
      <LockIcon style={styles.mapTypeIcon} />
    );
  }
}
