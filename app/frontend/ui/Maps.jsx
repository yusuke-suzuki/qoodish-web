import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SwipeableViews from 'react-swipeable-views';
import MapCollectionContainer from '../containers/MapCollectionContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateMapButtonContainer from '../containers/CreateMapButtonContainer';
import I18n from '../containers/I18n';
import Helmet from 'react-helmet';

const styles = {
  rootLarge: {
    maxWidth: 900,
    margin: '154px auto 200px'
  },
  rootSmall: {
    margin: '120px auto 64px'
  },
  progress: {
    textAlign: 'center',
    padding: 20
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex',
    marginBottom: 15
  }
};

export default class Maps extends React.PureComponent {
  componentDidMount() {
    if (!this.props.currentUser.isAnonymous) {
      this.props.refreshMyMaps();
      this.props.refreshFollowingMaps();
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/maps',
      'page_title': `${I18n.t('maps')} | Qoodish`
    });
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.renderHelmet()}
        <SwipeableViews
          index={this.props.tabValue}
          onChangeIndex={() => this.props.handleTabChange(this.props.tabValue)}
        >
          {this.renderFollowingMaps()}
          {this.renderMyMaps()}
        </SwipeableViews>
        <CreateMapButtonContainer />
      </div>
    );
  }

  renderHelmet() {
    return (
      <Helmet
        title={`${I18n.t('maps')} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/maps` }
        ]}
        meta={[
          { name: 'title', content: `${I18n.t('maps')} | Qoodish` },
          { property: 'og:title', content: `${process.env.ENDPOINT}/maps` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/maps`
          }
        ]}
      />
    );
  }

  renderFollowingMaps() {
    return (
      <div key='following'>
        {this.props.loadingFollowingMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.followingMaps)}
      </div>
    );
  }

  renderMyMaps() {
    return (
      <div key='mymaps'>
        {this.props.loadingMyMaps
          ? this.renderProgress()
          : this.renderMapContainer(this.props.myMaps)}
      </div>
    );
  }

  renderMapContainer(maps) {
    if (maps.length > 0) {
      return (
        <MapCollectionContainer maps={maps} />
      );
    } else {
      return (
        <NoContentsContainer
          contentType="map"
          action="create-map"
          secondaryAction="discover-maps"
          message={I18n.t('maps will see here')}
        />
      );
    }
  }
}
