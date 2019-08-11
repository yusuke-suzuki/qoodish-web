import React, { useCallback, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import Helmet from 'react-helmet';

const AppHelmet = () => {
  const mapState = useCallback(
    state => ({
      metadata: state.metadata.metadata,
      structuredData: state.metadata.structuredData
    }),
    []
  );

  const { metadata, structuredData } = useMappedState(mapState);

  useEffect(() => {
    gtag('config', process.env.GA_TRACKING_ID, {
      page_location: metadata.url,
      page_title: metadata.title
    });
  }, [metadata]);

  return (
    <Helmet
      title={metadata.title}
      link={[{ rel: 'canonical', href: metadata.url }]}
      meta={[
        metadata.noindex ? { name: 'robots', content: 'noindex' } : {},
        { name: 'title', content: metadata.title },
        {
          name: 'keywords',
          content: metadata.keywords
        },
        { name: 'theme-color', content: '#ffc107' },
        {
          name: 'description',
          content: metadata.description
        },
        { name: 'twitter:card', content: metadata.twitterCard },
        { name: 'twitter:title', content: metadata.title },
        {
          name: 'twitter:description',
          content: metadata.description
        },
        { name: 'twitter:image', content: metadata.image },
        { property: 'og:site_name', content: metadata.siteName },
        { property: 'og:title', content: metadata.title },
        { property: 'og:type', content: metadata.type },
        {
          property: 'og:url',
          content: metadata.url
        },
        { property: 'og:image', content: metadata.image },
        {
          property: 'og:description',
          content: metadata.description
        },
        { 'http-equiv': 'content-language', content: window.currentLocale }
      ]}
      script={[structuredData]}
    />
  );
};

export default React.memo(AppHelmet);
