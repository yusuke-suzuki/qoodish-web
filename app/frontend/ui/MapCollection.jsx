import React from 'react';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
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
        style={styles.gridTile}
      >
        <img src={map.image_url} />
        <GridListTileBar
          title={map.name}
          subtitle={<span>by: {map.owner_name}</span>}
          actionIcon={<div style={styles.mapTypeContainer}>{this.renderMapTypeIcon(map)}</div>}
        />
      </GridListTile>
    ));
  }

  renderMapTypeIcon(map) {
    let actions = [];
    if (map.private) {
      actions.push(<LockIcon style={styles.mapTypeIcon} key="private" />);
    }
    if (map.shared) {
      actions.push(<GroupIcon style={styles.mapTypeIcon} key="shared" />);
    } else {
      actions.push(<PersonIcon style={styles.mapTypeIcon} key="personal" />);
    }
    return actions;
  }
}
