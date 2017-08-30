import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import FeedContainer from '../containers/FeedContainer';
import DashboardContainer from '../containers/DashboardContainer';

const styles = {
  rootLarge: {
    marginTop: 144
  },
  rootSmall: {
    marginTop: 126
  },
  tabBarLarge: {
    top: 64
  },
  tabBarSmall: {
    top: 56
  },
};

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      value: 0
    };
  }

  componentWillMount() {
    this.props.updatePageTitle();
  }

  handleChange(event, value) {
    this.setState({ value });
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <AppBar position='fixed' style={this.props.large ? styles.tabBarLarge : styles.tabBarSmall}>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            fullWidth
            indicatorColor='accent'
            textColor='accent'
            centered
          >
            <Tab label='Timeline' />
            <Tab label='Maps' />
          </Tabs>
        </AppBar>
        {this.state.value === 0 &&
          <FeedContainer />
        }
        {this.state.value === 1 &&
          <DashboardContainer />
        }
      </div>
    );
  }
}
