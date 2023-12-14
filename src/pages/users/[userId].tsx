import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Layout from '../../components/Layout';
import UserProfile from '../../components/profiles/UserProfile';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import Custom404 from '../404';
import { NextPageWithLayout } from '../_app';

const UserPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dictionary = useDictionary();

  const { profile, isLoading } = useProfile(Number(userId));

  const title = profile?.name ? `${profile.name} | Qoodish` : 'Qoodish';
  const description = dictionary['meta description'];
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const thumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  if (!isLoading && !profile) {
    return <Custom404 />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/users/${userId}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${userId}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/users/${userId}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/users/${userId}`}
          hrefLang="x-default"
        />

        <meta name="robots" content="noindex" />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/users/${userId}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      <UserProfile id={Number(userId)} />
    </>
  );
};

UserPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default UserPage;
