import React from 'react';
import Button from '@material-ui/core/Button';

export default class CreateMapButton extends React.Component {
  render() {
    return (
      <div>
        {this.props.currentMap ? (
          this.renderRoleButton(this.props.currentMap)
        ) : (
          <Button variant="raised" color="secondary" disabled>{''}</Button>
        )}
      </div>
    );
  }


  renderRoleButton(map) {
    if (map.editable) {
      return (
        <Button variant="raised" disabled>
          OWNER
        </Button>
      );
    } else if (map.following) {
      return (
        <Button variant="raised" onClick={this.props.handleLeaveButtonClick}>
          UNFOLLOW
        </Button>
      );
    } else {
      return (
        <Button
          variant="raised"
          onClick={this.props.handleJoinButtonClick}
          color="primary"
        >
          FOLLOW
        </Button>
      );
    }
  }
}
