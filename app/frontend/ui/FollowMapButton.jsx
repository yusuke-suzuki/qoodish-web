import React from 'react';
import Button from '@material-ui/core/Button';
import I18n from '../containers/I18n';

export default class CreateMapButton extends React.PureComponent {
  render() {
    return (
      <div>
        {this.props.currentMap ? (
          this.renderRoleButton(this.props.currentMap)
        ) : (
          <Button variant="contained" color="secondary" disabled>{''}</Button>
        )}
      </div>
    );
  }


  renderRoleButton(map) {
    if (map.editable) {
      return (
        <Button variant="contained" disabled>
          {I18n.t('owner')}
        </Button>
      );
    } else if (map.following) {
      return (
        <Button variant="contained" onClick={this.props.handleUnfollowButtonClick}>
          {I18n.t('unfollow')}
        </Button>
      );
    } else {
      return (
        <Button
          variant="contained"
          onClick={() => this.props.handleFollowButtonClick(this.props.currentUser)}
          color="primary"
        >
          {I18n.t('follow')}
        </Button>
      );
    }
  }
}
