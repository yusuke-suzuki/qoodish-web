import React from 'react';
import loadable from '@loadable/component';

const GMapContainer = loadable(() => import(/* webpackChunkName: "gmap" */ '../containers/GMapContainer'));
const MapSummaryContainer = loadable(() => import(/* webpackChunkName: "map_summary" */ '../containers/MapSummaryContainer'));
const MapBottomSeatContainer = loadable(() => import(/* webpackChunkName: "map_bottom_seat" */ '../containers/MapBottomSeatContainer'));
const DeleteMapDialogContainer = loadable(() => import(/* webpackChunkName: "delete_map_dialog" */ '../containers/DeleteMapDialogContainer'));
const InviteTargetDialogContainer = loadable(() => import(/* webpackChunkName: "invite_target_dialog" */ '../containers/InviteTargetDialogContainer'));
const SpotCardContainer = loadable(() => import(/* webpackChunkName: "spot_card" */ '../containers/SpotCardContainer'));

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
    this.refreshMap();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.refreshMap();
    }
  }

  refreshMap() {
    this.props.fetchMap();
    this.props.fetchSpots();
    this.props.fetchMapReviews();
    this.props.fetchFollowers();
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
