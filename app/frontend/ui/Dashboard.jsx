import React, { Component } from 'react';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.updatePageTitle();
  }

  render() {
    return (
      <div>
        Dashboard
      </div>
    );
  }
}
