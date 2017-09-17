import React, { Component } from 'react';
import DashboardContainer from '../containers/DashboardContainer';

export default class Home extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
  }

  render() {
    return (
      <div>
        <DashboardContainer />
      </div>
    );
  }
}
