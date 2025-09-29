import type { ReactElement } from 'react';

import { Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import useDictionary from '../../hooks/useDictionary';
import type { NextPageWithLayout } from '../_app';

const PrivacyPage: NextPageWithLayout = () => {
  const dictionary = useDictionary();
  const router = useRouter();

  const title = `${dictionary['privacy policy']} | Qoodish`;
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
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja${router.pathname}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
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
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      <Typography variant="h4" gutterBottom>
        プライバシーポリシー
      </Typography>
      <Typography variant="h5" gutterBottom>
        はじめに
      </Typography>
      <Typography component="p" gutterBottom>
        Qoodish 製作委員会 (以下「当委員会」といいます)
        は、提供するサービス「Qoodish」(以下「Qoodish」といいます)
        を利用される方 (以下「Qoodish ユーザー」といいます)
        のプライバシーを尊重するために、Qoodish
        ユーザーの個人情報を以下の定義に従い、適切に管理するよう取り組みを行って参ります。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        個人情報の定義について
      </Typography>
      <Typography component="p" gutterBottom>
        個人情報とは、Qoodish を通じて Qoodish
        ユーザーから取得する氏名・メールアドレス・ログイン時に利用する SNS
        アカウントのデータ他、個人を特定できる情報のことを指します。
        本項で定める個人情報は、Qoodish
        ユーザーが初回を含む毎回のログイン時にその都度サービス提供に必要なもののみに限定して収集いたします。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        個人情報の利用目的について
      </Typography>
      <Typography component="p" gutterBottom>
        個人情報とは、Qoodish を通じて Qoodish
        ユーザーから取得する氏名・メールアドレス・ログイン時に利用する SNS
        アカウントのデータ他、個人を特定できる情報のことを指します。
        本項で定める個人情報は、Qoodish
        ユーザーが初回を含む毎回のログイン時にその都度サービス提供に必要なもののみに限定して収集いたします。
        <br />
        収集する個人情報の内容は以下の通りです。
        <br />
        ・SNS アカウントの個人データ (氏名・メールアドレス・ユーザー ID)
        <br />
        ・GPS によるログイン中の位置情報
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        個人情報の共有または利用制限について
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会は、以下に定める場合を除き、事前に Qoodish
        ユーザー本人の同意を得ず、本来の利用目的を逸脱した形での個人情報利用を行うことはありません。
        <br />
        ・法令によって認められた場合
        <br />
        ・Qoodish ユーザーの皆様ご自身の了承があった場合
        <br />
        ・人の生命や身体、または財産の保護のために必要で、事前に Qoodish
        ユーザー本人の同意を得ることが難しい場合
        <br />
        ・裁判所や検察庁、警察、税務署、弁護士会またはこれらに準ずる権限を持つ機関より、個人情報開示を求められた場合
        <br />
        ・Qoodish
        のサービス提供のために当委員会が必要と判断した際に弁護士など、当委員会に対して秘密保持義務を負うものに対して開示する場合
        <br />
        ・事業譲渡等に伴い、継承者が他に発生した場合、該当する関係者に対して開示する場合
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        個人情報の安全管理について
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会では、個人情報の漏洩または毀損の防止、またその他個人情報の利用に対し、安全かつ適切な利用の監督を行います。当委員会では、サービスの提供に必要な範囲内で、権限を与えられたメンバーのみが個人情報を取り扱います。
        個人情報の取り扱いを外部に委託する際には、機密保持契約を締結の上で委託することとしています。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        Qoodish のサービス提供以外での個人情報の取り扱いについて
      </Typography>
      <Typography component="p" gutterBottom>
        Qoodish
        を通してアクセスが可能な第三者のサイト及びサービスにおいて収集されうる個人情報の利用については、当委員会では関知しておりません。
        そのため、これらの企業やサービスにおける独立した活動について、当委員会では一切の責任を負わないものとします。
        当該サイト・サービスのプライバシーポリシーをご確認ください。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        Qoodish の開示・訂正・削除
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会は、個人情報保護法その他の法令に基づきまして、個人情報の開示、訂正、追加、削除、利用停止、消去、第三者提供の停止、利用目的の通知の請求に対応いたします。
        ただ、請求元が Qoodish
        ユーザーご本人であると確認ができない場合や、法令の定めている要件を満たさない場合には、ご希望に添えないこともございます。予めご了承ください。
        また、アクセスログ等の個人情報以外の情報については、基本的に開示しない方向とさせていただいております。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        プライバシーポリシーの更新について
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会は、個人情報保護のため、法令の変更や必要に応じる形で、本プライバシーポリシーを改定することがございます。
        その際は最新のプライバシーポリシーを本ページに掲載したうえで、Qoodish
        ユーザーの皆様に対して通知をさせていただきます。
        その都度本ページをご確認いただきまして、ご同意の上でのサービス利用をお願いいたします。
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom>
        プライバシーポリシーに関するお問い合わせ先について
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会への本件のお問い合わせは、下記へお願いいたします。
        <br />
        メールアドレス: support@qoodish.com
      </Typography>
    </>
  );
};

PrivacyPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout hideBottomNav>{page}</Layout>;
};

export default PrivacyPage;
