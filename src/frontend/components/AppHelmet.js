import React from 'react';
import Helmet from 'react-helmet';

const AppHelmet = () => {
  return (
    <Helmet
      title="Qoodish"
      link={[{ rel: 'canonical', href: process.env.ENDPOINT }]}
      meta={[
        { name: 'title', content: 'Qoodish' },
        {
          name: 'keywords',
          content:
            'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip'
        },
        { name: 'theme-color', content: '#ffc107' },
        {
          name: 'description',
          content:
            'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Qoodish' },
        {
          name: 'twitter:description',
          content:
            'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
        },
        { name: 'twitter:image', content: process.env.OGP_IMAGE_URL },
        { property: 'og:site_name', content: 'Qoodish - マップベースド SNS' },
        { property: 'og:title', content: 'Qoodish' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: process.env.ENDPOINT
        },
        { property: 'og:image', content: process.env.OGP_IMAGE_URL },
        {
          property: 'og:description',
          content:
            'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
        },
        { 'http-equiv': 'content-language', content: window.currentLocale }
      ]}
      script={[
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'WebSite',
            name: 'Qoodish',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': process.env.ENDPOINT
            },
            headline: 'Qoodish | マップベースド SNS',
            image: {
              '@type': 'ImageObject',
              url: process.env.OGP_IMAGE_URL,
              width: 1280,
              height: 630
            },
            datePublished: '',
            dateModified: '',
            author: {
              '@type': 'Person',
              name: ''
            },
            publisher: {
              '@type': 'Organization',
              name: 'Qoodish',
              logo: {
                '@type': 'ImageObject',
                url: process.env.OGP_IMAGE_URL,
                width: 1280,
                height: 630
              }
            },
            description:
              'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
          })
        }
      ]}
    />
  );
};

export default React.memo(AppHelmet);
