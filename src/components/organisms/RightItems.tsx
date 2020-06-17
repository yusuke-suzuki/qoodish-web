import React from 'react';
import { CardContent, Typography, Divider, Paper } from '@material-ui/core';
import { Link } from '@yusuke-suzuki/rize-router';
import I18n from '../../utils/I18n';

const RecommendMaps = React.lazy(() =>
  import(/* webpackChunkName: "recommend_maps" */ './RecommendMaps')
);
const TrendingMaps = React.lazy(() =>
  import(/* webpackChunkName: "trending_maps" */ './TrendingMaps')
);
const TrendingSpots = React.lazy(() =>
  import(/* webpackChunkName: "trending_spots" */ './TrendingSpots')
);
const FbPage = React.lazy(() =>
  import(/* webpackChunkName: "fb_page" */ '../molecules/FbPage')
);

const styles = {
  item: {
    marginBottom: 20
  },
  cardContent: {
    paddingBottom: 16
  },
  fbPage: {
    textAlign: 'center'
  }
};

const Footer = React.memo(() => {
  return (
    <Paper elevation={0}>
      <CardContent style={styles.cardContent}>
        <div>
          <Link to="/terms">{I18n.t('terms of service')}</Link>
        </div>
        <div>
          <Link to="/privacy">{I18n.t('privacy policy')}</Link>
        </div>
        <Typography variant="caption">
          © 2019 Qoodish, All rights reserved.
        </Typography>
      </CardContent>
    </Paper>
  );
});

const RightItems = () => {
  return (
    <div>
      <RecommendMaps />
      <Divider style={styles.item} />
      <div style={styles.item}>
        <TrendingMaps />
      </div>
      <div style={styles.item}>
        <TrendingSpots />
      </div>
      <div style={styles.item}>
        <Footer />
      </div>
      <div style={styles.fbPage}>
        <FbPage />
      </div>
    </div>
  );
};

export default React.memo(RightItems);
