import React from 'react';
import Button from '@material-ui/core/Button';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const styles = {
  expandButtonContainer: {
    width: '100%',
    position: 'fixed',
    bottom: 116,
    textAlign: 'center',
    zIndex: 1300
  },
  expandButton: {
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)'
  }
};

export default class ExpandMapSummaryButton extends React.Component {
  render() {
    return (
      <div style={styles.expandButtonContainer}>
        <Button
          variant="fab"
          style={styles.expandButton}
          onClick={this.props.handleShowTimelineClick}
          mini={true}
          color="primary"
        >
          <ExpandLessIcon />
        </Button>
      </div>
    );
  }
}
