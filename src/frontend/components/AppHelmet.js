import React, { useCallback, useEffect, useMemo } from 'react';
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

  const locale = useMemo(() => {
    const parsedUrl = new URL(window.location.href);
    const hl = parsedUrl.searchParams.get('hl');

    switch (hl) {
      case 'ja':
        return 'ja_JP';
      default:
        return 'en_US';
    }
  }, [metadata]);

  const canonicalUrl = useMemo(() => {
    const parsedUrl = new URL(window.location.href);
    const hl = parsedUrl.searchParams.get('hl');

    if (!hl) {
      return metadata.url;
    }

    switch (hl) {
      case 'en':
        return metadata.url + '?hl=en';
      case 'ja':
        return metadata.url + '?hl=ja';
      default:
        return metadata.url;
    }
  }, [metadata]);

  const description = useMemo(() => {
    if (metadata.description) {
      if (metadata.description.length > 300) {
        return metadata.description.substring(0, 300) + '...';
      } else {
        return metadata.description;
      }
    } else {
      const parsedUrl = new URL(window.location.href);
      const hl = parsedUrl.searchParams.get('hl');

      switch (hl) {
        case 'ja':
          return 'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。';
        default:
          return 'Qoodish allows you to create maps with friends and share your favorite places.';
      }
    }
  }, [metadata]);

  const siteNameSecondary = useMemo(() => {
    const parsedUrl = new URL(window.location.href);
    const hl = parsedUrl.searchParams.get('hl');

    switch (hl) {
      case 'ja':
        return 'マップベースド SNS';
      default:
        return 'Map-based SNS';
    }
  }, [metadata]);

  useEffect(() => {
    gtag('config', process.env.GA_TRACKING_ID, {
      page_location: metadata.url,
      page_title: metadata.title
    });
  }, [metadata]);

  return (
    <Helmet
      title={metadata.title ? metadata.title : 'Qoodish'}
      link={[
        { rel: 'canonical', href: canonicalUrl },
        { rel: 'alternate', href: metadata.url + '?hl=en', hreflang: 'en' },
        { rel: 'alternate', href: metadata.url + '?hl=ja', hreflang: 'ja' },
        {
          rel: 'alternate',
          href: metadata.url,
          hreflang: 'x-default'
        }
      ]}
      meta={[
        metadata.noindex ? { name: 'robots', content: 'noindex' } : {},
        { name: 'title', content: metadata.title ? metadata.title : 'Qoodish' },
        {
          name: 'keywords',
          content: metadata.keywords
            ? metadata.keywords
            : 'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip'
        },
        { name: 'theme-color', content: '#ffc107' },
        {
          name: 'description',
          content: description
        },
        { name: 'twitter:card', content: metadata.twitterCard },
        { name: 'twitter:title', content: metadata.title },
        {
          name: 'twitter:description',
          content: description
        },
        { name: 'twitter:image', content: metadata.image },
        { property: 'og:site_name', content: `Qoodish - ${siteNameSecondary}` },
        {
          property: 'og:title',
          content: metadata.title ? metadata.title : 'Qoodish'
        },
        {
          property: 'og:type',
          content: metadata.type ? metadata.type : 'website'
        },
        {
          property: 'og:url',
          content: canonicalUrl
        },
        { property: 'og:image', content: metadata.image },
        {
          property: 'og:description',
          content: description
        },
        {
          property: 'og:locale',
          content: locale
        }
      ]}
      script={[structuredData]}
    />
  );
};

export default React.memo(AppHelmet);
