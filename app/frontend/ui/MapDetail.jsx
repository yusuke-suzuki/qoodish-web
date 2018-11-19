import React from 'react';
import GMapContainer from '../containers/GMapContainer';
import MapSummaryContainer from '../containers/MapSummaryContainer';
import MapBottomSeatContainer from '../containers/MapBottomSeatContainer';
import DeleteMapDialogContainer from '../containers/DeleteMapDialogContainer';
import InviteTargetDialogContainer from '../containers/InviteTargetDialogContainer';
import SpotCardContainer from '../containers/SpotCardContainer';
import LeaveMapDialogContainer from '../containers/LeaveMapDialogContainer';
import Helmet from 'react-helmet';
import Drawer from '@material-ui/core/Drawer';

const styles = {
  containerLarge: {
  },
  containerSmall: {
    position: 'fixed',
    top: 56,
    left: 0,
    bottom: 71,
    right: 0,
    display: 'block',
    width: '100%'
  },
  drawerPaperLarge: {
  },
  drawerPaperSmall: {
    height: '100%'
  }
};

export default class MapDetail extends React.PureComponent {
  componentDidMount() {
    this.handleMapLoaded();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      await this.props.fetchMap();
      this.handleMapLoaded();
    }
  }

  async handleMapLoaded() {
    this.props.fetchSpots();
    this.props.fetchMapReviews();
    this.props.fetchFollowers();

    if (!this.props.currentMap) {
      await this.props.fetchMap();
    }
    this.props.initCenter(this.props.currentMap);

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': `/maps/${this.props.currentMap.id}`,
      'page_title': `${this.props.currentMap.name} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.handleUnmount();
  }

  render() {
    return (
      <div>
        {this.props.currentMap && this.renderHelmet(this.props.currentMap)}
        {this.props.large ? this.renderLarge() : this.renderSmall()}
        <DeleteMapDialogContainer mapId={this.props.match.params.mapId} />
        <InviteTargetDialogContainer mapId={this.props.match.params.mapId} />
        <SpotCardContainer mapId={this.props.match.params.mapId} />
        <LeaveMapDialogContainer mapId={this.props.match.params.mapId} />
      </div>
    );
  }

  renderHelmet(map) {
    return (
      <Helmet
        title={`${map.name} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/maps/${map.id}` }
        ]}
        meta={[
          map.private ? { name: 'robots', content: 'noindex' } : {},
          { name: 'title', content: `${map.name} | Qoodish` },
          { name: 'keywords', content: `${map.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`},
          { name: 'description', content: map.description },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `${map.name} | Qoodish` },
          { name: 'twitter:description', content: map.description },
          { name: 'twitter:image', content: map.image_url },
          { property: 'og:title', content: `${map.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/maps/${map.id}`
          },
          { property: 'og:image', content: map.image_url },
          {
            property: 'og:description',
            content: map.description
          }
        ]}
      />
    );
  }

  renderLarge() {
    return (
      <div>
        {this.renderMapSummaryDrawer()}
        <GMapContainer />
      </div>
    );
  }

  renderSmall() {
    return (
      <div>
        <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
          <GMapContainer />
        </div>
        <MapBottomSeatContainer map={this.props.currentMap} />
        {this.renderMapSummaryDrawer()}
      </div>
    );
  }

  renderMapSummaryDrawer() {
    return (
      <Drawer
        variant={this.props.large ? "persistent" : "temporary"}
        anchor={this.props.large ? "left" : "bottom"}
        open={this.props.large ? true : this.props.mapSummaryOpen}
        PaperProps={{ style: this.props.large ? styles.drawerPaperLarge : styles.drawerPaperSmall }}
      >
        <MapSummaryContainer
          mapId={this.props.match.params.mapId}
          dialogMode={this.props.large ? false : true}
        />
      </Drawer>
    );
  }
}
