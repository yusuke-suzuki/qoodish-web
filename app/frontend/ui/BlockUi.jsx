import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';

const styles = {
  blockUi: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    zIndex: 2000,
    cursor: 'wait',
    opacity: '0.5',
    backgroundColor: 'white'
  },
  progress: {
    textAlign: 'center',
    marginTop: '50vh'
  }
};

export default class BlockUi extends Component {
  render() {
    return <div>{this.props.blocking ? this.renderBlockUi() : null}</div>;
  }

  renderBlockUi() {
    return (
      <div style={styles.blockUi}>
        <div style={styles.progress}>
          <CircularProgress />
        </div>
      </div>
    );
  }
}
