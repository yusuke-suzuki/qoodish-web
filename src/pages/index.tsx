import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useContext } from 'react';
import Layout from '../components/Layout';
import Timeline from '../components/home/Timeline';
import TrendingReviews from '../components/home/TrendingReviews';
import AuthContext from '../context/AuthContext';
import useDictionary from '../hooks/useDictionary';
import { NextPageWithLayout } from './_app';

const HomePage: NextPageWithLayout = () => {
  const dictionary = useDictionary();
  const router = useRouter();

  const { currentUser, isLoading } = useContext(AuthContext);

  const title = 'Qoodish';
  const description = dictionary['meta description'];
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const thumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
          hrefLang="x-default"
        />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      {!isLoading && !currentUser && <TrendingReviews />}
      {!isLoading && currentUser && <Timeline />}
    </>
  );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HomePage;
