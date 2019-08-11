import { UPDATE_METADATA } from '../actionTypes';

import I18n from '../utils/I18n';

const initialState = {
  metadata: {
    title: 'Qoodish',
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip',
    url: process.env.ENDPOINT,
    description: I18n.t('og description'),
    siteName: `Qoodish - ${I18n.t('og site name secondary')}`,
    type: 'website',
    twitterCard: 'summary_large_image',
    image: process.env.OGP_IMAGE_URL,
    noindex: {}
  },
  structuredData: {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    name: 'Qoodish',
    url: process.env.ENDPOINT,
    logo: process.env.ICON_512,
    mainEntityOfPage: process.env.ENDPOINT,
    headline: `Qoodish - ${I18n.t('site name secondary')}`,
    image: {
      '@type': 'ImageObject',
      url: process.env.OGP_IMAGE_URL,
      width: 1280,
      height: 630
    },
    description: I18n.t('og description')
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_METADATA:
      const metadata = Object.assign(
        {},
        initialState.metadata,
        action.payload.metadata
      );
      return Object.assign({}, state, {
        metadata: metadata
      });
    default:
      return state;
  }
};

export default reducer;
