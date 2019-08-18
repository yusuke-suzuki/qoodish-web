import { UPDATE_METADATA } from '../actionTypes';

const initialState = {
  metadata: {
    title: '',
    keywords: '',
    url: process.env.ENDPOINT,
    description: '',
    type: '',
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
    headline: `Qoodish - Map-based SNS`,
    image: {
      '@type': 'ImageObject',
      url: process.env.OGP_IMAGE_URL,
      width: 1280,
      height: 630
    },
    description:
      'Qoodish allows you to create maps with friends and share your favorite places.'
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
