import React, { memo } from 'react';

import Typography from '@material-ui/core/Typography';

import I18n from '../../utils/I18n';
import Layout from '../../components/Layout';
import Head from 'next/head';

export default memo(function Terms() {
  return (
    <Layout hideBottomNav={true} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('terms of service')} | Qoodish`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/terms`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/terms?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/terms?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/terms`}
          hrefLang="x-default"
        />
        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta
          name="title"
          content={`${I18n.t('terms of service')} | Qoodish`}
        />
        <meta name="description" content={I18n.t('meta description')} />
        <meta
          property="og:title"
          content={`${I18n.t('terms of service')} | Qoodish`}
        />
        <meta property="og:description" content={I18n.t('meta description')} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}/terms`}
        />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OGP_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE}
        />
        <meta
          name="twitter:title"
          content={`${I18n.t('terms of service')} | Qoodish`}
        />
        <meta name="twitter:description" content={I18n.t('meta description')} />
        <meta property="og:locale" content={I18n.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <Typography variant="h3" gutterBottom>
        利用規約
      </Typography>
      <Typography component="p" gutterBottom>
        Qoodish 製作委員会 (以下、当委員会といいます)
        は、当委員会が提供するサービスである「Qoodish」(以下、Qoodishといいます)
        の利用について、以下のように定めます。(以下、本規約といいます)。 Qoodish
        の利用者 (以下、お客さまといいます)
        は、予め本規約に同意したうえで、Qoodish を利用するものとします。
        なお、本規約は必要に応じて変更することがございます。変更を行った際はお客さまに
        Qoodish
        内の通知機能により通知をさせていただきますので、最新の利用規約を適宜ご参照ください。
      </Typography>
      <br />
      <Typography variant="h4" gutterBottom>
        1. Qoodish の目的
      </Typography>
      <Typography component="p" gutterBottom>
        Qoodishは、お客さまによって投稿されたプレイスに関する画像・コメント等
        (以下、お客さまから Qoodish
        に投稿された情報について「レポート」といいます) を Qoodish
        のユーザー間で共有し、旅行や外食の際の参考情報として活用していただくことを主な目的としています。
      </Typography>
      <br />
      <Typography variant="h4" gutterBottom>
        2. 会員登録の手続き
      </Typography>
      <Typography component="p" gutterBottom>
        お客さまは、当委員会所定の手続きに従って、Qoodish
        を利用するためのユーザー (以下、Qoodish ユーザーといいます)
        の登録手続きができるものとします。
        また、当委員会は登録時のお客さまの手続内容によって、Qoodish
        利用時のサービス内容について差異を発生させることがあります
        (手続きにおいて、推奨の手順を行っていない場合に限ります)。
        差異の内容につきましては、当委員会が任意に決定し、随時変更できるものとします。
      </Typography>
      <br />
      <Typography variant="h4" gutterBottom>
        3. アカウントについて
      </Typography>
      <Typography component="p" gutterBottom>
        Qoodish は、ソーシャルネットワーキングサービス (以下、SNS といいます)
        のアカウントを所持し、それを利用することを前提にサービスを提供しています。
        お客さまがログイン時に使用するアカウントおよびそのパスワードの登録・管理につきましては、お客さまがご自身の責任において行うものとし、お客さまの管理不十分、使用上の過誤、第三者の使用などにより生じた損害について、当委員会は一切の責任を負わないものとします。
        また、お客さまは Qoodish へのログイン時に使用するアカウントの提供元 SNS
        の利用もご自身の責任において行うものとし、当該サービスの利用については当該サービスの規定する各規約の定めに従うものとします。
        当該サービスを利用したことによって生じた損害・運営者とお客さまの間に生じたトラブル等につきましては、当委員会は一切の責任を負わないものとします。
      </Typography>
      <br />
      <Typography variant="h4" gutterBottom>
        4. Qoodish の利用について
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        ① Qoodish の転用・転売の禁止
      </Typography>
      <Typography component="p" gutterBottom>
        (1) お客さまは、当委員会が提供する Qoodish
        について、その全部あるいは一部を問わず、営業活動その他営利を目的とした行為またはそれに準ずる行為やそのための準備行為を目的として、利用またはアクセスしてはならないものとします。
        また、その他宗教活動や政治活動などの目的での利用またはアクセスも行ってはならないものとします。
        <br />
        (2) Qoodish
        へ投稿されたレポートを無断転載・無断利用することは禁止します。
        ただし、当該レポートを投稿した本人は除きます。
        <br />
        (3)
        レポートを投稿した本人による当該レポートの利用等、本規約が特に認めた場合以外で、Qoodish
        に掲載されているレポートを利用して利益を得た場合は、当委員会はその利益相当額について請求できる権利を有するものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ② Qoodish の変更・停止
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会はお客さまへご提供している Qoodish
        の内容を当委員会の都合により変更することがございます。
        また、災害・事故・その他緊急事態発生にともなってサービスの運営が困難な状況に陥った場合には、Qoodish
        を停止する場合がありますので、予めご了承ください。
        なお、事前にお客さまの承諾を得ることなく Qoodish
        を変更・停止したことにより、お客さままたは第三者が損害を受けた場合につきましても、当委員会は一切の補償を行わないものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ③ Qoodish の利用に必要となる設備
      </Typography>
      <Typography component="p" gutterBottom>
        お客さまが Qoodish をご利用になるには、Web
        アクセスの環境が必要になります。 Web
        アクセスにつきましては、お客さま自らの責任と費用で必要な機器・ソフトウェアを適切に準備、操作していただく必要があります。
        当委員会はお客さまが Web
        アクセスを行う上での準備、方法については一切の関与をしておりません。
        <br />
        推奨ブラウザ: Google Chrome
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ④ レポートの投稿及び著作権について
      </Typography>
      <Typography component="p" gutterBottom>
        (1) Qoodish にレポートの投稿を行う際には、Qoodish
        会員登録が必要になります。
        <br />
        (2) Qoodish
        にレポートの投稿を行う際には、当委員会が別に定めるガイドラインについても順守していただきます。このガイドラインは、本規約の一部を構成するものとし、このガイドラインを含めたものが本規約となります。
        <br />
        (3) Qoodish ユーザーが Qoodish
        にレポートの投稿を行った時点で、当該レポートの国内外における複製、公衆送信、頒布、翻訳・翻案等、著作権法上の権利
        (著作権法第 27 および 28 条に定める権利を含みます)
        を、当該著作権の存続期間の満了日まで、Qoodish
        ユーザーが当委員会に対して無償で利用することを許諾したものとします。
        <br />
        (4) Qoodish
        ユーザーご自身が投稿されたレポートに関しては、その複製、公衆送信、頒布、翻訳・翻案等、著作権法上の権利を当該
        Qoodish
        ユーザーがすべて保有していることを保証していただくものとします。よって、著作権法上の権利の有無につきましては、投稿の際に十分な注意を払ってください。
        また、第三者の著作物等を利用して投稿を行う場合、Qoodish
        ユーザーの責任と負担において前記 (3)
        の許諾に必要な権利処理がすでに成されていることを前提としますので、第三者の著作物等を利用される場合にも十分に注意を払って投稿を行ってください。
        <br />
        (5) 当委員会が Qoodish
        ユーザーのレポートを利用する場合には、地域制限、著作権表示義務その他付随条件はないものとし、Qoodish
        ユーザーによる利用許諾の期間は Qoodish
        ユーザーの著作権が存在する限り続くものとします。また、ロイヤリティなどの対価は一切発生しないこととします。
        <br />
        (6) 当委員会が Qoodish
        ユーザーのレポートを当委員会のサイト内にて利用する場合がございます。この際、Qoodish
        ユーザーのレポートの一部を要約・抜粋したり、投稿された写真 (画像)
        のサイズ変更・切り抜きを行うなど一部改編等を行う場合がございます。
        Qoodish
        ユーザーのレポートについては細心の注意を払って利用させていただきますが、万が一、当該改編行為が
        Qoodish
        ユーザーの名誉・声望等を侵害している場合には、当委員会までご連絡ください。速やかに対応を検討の上、ご連絡させていただきます。
        <br />
        (7) 当委員会は Qoodish ユーザーのレポートを利用したことによって Qoodish
        ユーザーが受けた損害について、一切の補償を行わないものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑤ レポート投稿における外部サービス連携
      </Typography>
      <Typography component="p" gutterBottom>
        (1) Qoodish ユーザーは SNS
        等の外部サービスとの連携機能を利用してログインする際に、当委員会がデータにアクセスすることについての許可を求められることがあり、かかる内容を確認の上、許可した場合に限り、連携機能を利用することができるものとします。
        <br />
        (2) 各 SNS のユーザー登録・その利用については (Qoodish
        ユーザーが作成したレポートの投稿を含みます)、Qoodish ユーザーは各 SNS
        の運営者が規定する各規約の定めに従うものとします。
        <br />
        (3) Qoodish が連携機能を持つ SNS を利用する場合、Qoodish
        ユーザーは、自己の責任において当該サービスを利用するものとし、当委員会は、当該サービスを利用したことによって生じた損害、当該サービス運営者と利用者などとの間に生じたトラブルその他の当該サービスに関連する一切の事項について何ら責任を負わないものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑥ 免責事項
      </Typography>
      <Typography component="p" gutterBottom>
        (1) プレイスの情報について
        <br />
        当委員会は、掲載されたプレイスの情報につきましては、いかなる保証もいたしません。お出かけの際には、住所・営業時間・定休日の情報などを電話などの手段で直接プレイスに確認されることをお勧めいたします。
        また、掲載されたプレイスの情報によってお客さまに生じた損害、お客さま同士のトラブルにつきましては、当委員会は一切の責任を負わないものとします。掲載されたプレイスの情報が正しくない場合は、当委員会までご連絡ください。(連絡先は
        support@qoodish.com です)。
        <br />
        (2) レポートの内容
        <br />
        当委員会は、投稿されているレポートの内容に関してはいかなる保証もいたしません。お客さまのご判断に基づいてのご利用をお願いいたします。
        また、投稿されたレポートによって生じたお客さまの損害
        (お客さまが作成した各種レポートによるコンピュータウイルスへの感染被害を含みます)
        や、お客さま同士のトラブルに対しても、当委員会は一切の補償や関与をしないものとします。
        <br />
        (3) リンク先のサイト
        <br />
        当委員会は、Qoodish
        からリンクされた第三者が運営するサイトに関して、そこで生じうるお客さま同士のトラブルへの対処を含め、いかなる補償・関与をしないものとします。
        <br />
        (4) レポートの削除
        <br />
        Qoodish
        は、お客さまからの自己責任に基づくレポートの投稿によって成り立つコミュニティですが、Qoodish
        ユーザーの皆さまに快適にご利用いただくため、下記に該当・類似するレポートが発見され次第、予告なく、当該レポートを
        Qoodish 上から削除する場合があります。
        また、連携する外部サービスへの投稿につきましては、第三者が運営するサービスでの表示という扱いとなるため、削除対象とはせず、当委員会の関与するところではないものとします。
        なお、削除対象になるか否かは、すべて当委員会が判断いたします。
        <br />
        1. 本規約およびプライバシーポリシーに反するもの
        <br />
        2. 公序良俗に反するもの
        <br />
        3. Qoodish の趣旨、または投稿の対象となるプレイスと関係のないもの
        <br />
        4. 有害なプログラム・スクリプトを含むもの
        <br />
        5.
        営利を目的としたものや個人的な売買・譲渡を持ちかける内容、宣伝行為に関するもの
        <br />
        6. その他、Qoodish 運営を妨げる等、当委員会が不適切と判断したもの
        <br />
        (5) 地図情報について
        <br />
        当委員会は、投稿されたプレイスの所在地に関わる地図情報についてはいかなる保証もいたしません。
        なお、地図情報は Google.inc より提供され、Google.inc
        にて定める利用規約およびプライバシーポリシーが適用となります。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑦ Qoodish が保持する著作権・財産権やその他の権利について
      </Typography>
      <Typography component="p" gutterBottom>
        (1) Qoodish
        に含まれているレポート及び個々の情報、画像、広告、デザイン等に関する著作権、商標権、その他の知的財産権、及びその他の財産権はすべて当委員会または正当な権利者に帰属しています。
        <br />
        (2) Qoodish
        及び関連して使用されているすべてのソフトウェアは、知的財産権に関する法令等によって、保護されている財産権を含みます。
        <br />
        (3)
        お客さまは、当委員会から利用・使用を許諾されている場合や、法令により権利者からの許諾なく利用・使用することを許容されている場合を除き、Qoodish
        及び Qoodish
        の内容について複製、変種、改変、掲載、転載、公衆送信、配布、販売、提供、翻訳・翻案その他あらゆる利用または使用を行ってはなりません。
        <br />
        (4) お客さまが (1) ~ (3)
        に反する行為によって被った損害につきましては、当委員会は一切の責任を負わないものとします。
        また、お客さまがこれらの行為によって利益を得た場合に、当委員会はその利益相当額を請求できるものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑧ 禁止行為について
      </Typography>
      <Typography component="p" gutterBottom>
        (1) お客さまが Qoodish
        を利用するにあたって、次の行為を行うことを禁止します。
        よりよいサービス提供のために定めておりますので、ご了承ください。
        <br />
        1. 法令や本規約にて特例で認められている場合を除き、Qoodish
        の提供する情報を当委員会の事前の同意なく、複写、その他の方法により再生、複製、送付、譲渡、頒布、配布、転売、またはこれらの目的で使用するために保管すること
        <br />
        2. 本規約に反すること
        <br />
        3. 公序良俗に反すること
        <br />
        4.
        違法行為、犯罪的行為、重大な危険行為に結びつくことまたは、これらを助長するような行為
        <br />
        5. 当委員会、他のお客さままたは第三者の知的財産権
        (著作権、意匠権、実用新案権、商標権、特許権、ノウハウなどを含みますが、これに限定されるものではありません)
        を侵害すること
        <br />
        6.
        他のお客さままたは第三者の権利または利益を違法に侵害したり、そのおそれがある行為
        <br />
        7. Qoodish の運営を妨げるような行為、または当委員会の信用を毀損する行為
        <br />
        8. Qoodish ユーザー登録時に情報を偽って登録すること
        <br />
        9. アカウントの不正使用、第三者へのアカウントの引き渡し
        (一時的な使用を含む)
        <br />
        10. 面識のない異性との出会い等を目的として Qoodish の機能を利用すること
        <br />
        11. その他、当委員会が不適切と判断したもの
        <br />
        (2) お客さまによって (1) に該当する行為があった場合、もしくは Qoodish
        の趣旨・目的に照らして不適切であると当委員会が判断した場合には、当委員会は当該お客さまに対して、Qoodish
        の利用停止その他の当委員会が適切であると判断する処置
        (以下「利用停止措置」といいます) を取ることが可能であるとします。
        なお、利用停止措置はお客さまの帰責性の有無にかかわらず、当委員会の裁量・判断に基づいて行うこととします。
        またその理由につきましては、その如何を問わずお客さまにお答えすることは一切いたしません。
        加えて、利用停止措置によって生じたお客さま側への損害につきましては、当委員会は一切の責任を負わないものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑨ 退会の手続きについて
      </Typography>
      <Typography component="p" gutterBottom>
        (1) Qoodish
        ユーザーが退会を希望する場合は、当委員会の所定の退会手続きを行うものとします。
        <br />
        (2) Qoodish
        ユーザーは、退会手続きを行った場合、当委員会でご利用いただいていた
        Qoodish ユーザーのアカウントに関する権利の一切を失うものとします。
        <br />
        (3) Qoodish ユーザーが退会手続きを完了した場合、上項目の「3.
        アカウントについて」およびプライバシーポリシー
        (https://qoodish.com/privacy)、「4. Qoodish の利用について」内の「⑥
        免責事項、⑦ Qoodish が保持する著作権・財産権やその他の権利について、⑧
        禁止事項について、⑪
        準拠法および裁判管轄」については有効のままであるとします。
        <br />
        (4) お客さまが (1) ~ (3)
        に反する行為によって被った損害につきましては、当委員会は一切の責任を負わないものとします。
        また、お客さまがこれらの行為によって利益を得た場合に、当委員会はその利益相当額を請求できるものとします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑩ 本規約の変更について
      </Typography>
      <Typography component="p" gutterBottom>
        当委員会は、本規約の内容を変更できるものとします。その場合、Qoodish
        上での告知その他当委員会が適当と認める方法によって告知することとします。
        当委員会が定める方法によって Qoodish
        ユーザーがそれについて同意した場合には、当該変更の効力が発効します。
        Qoodish
        ユーザーからの同意を得る場合には、その都度お客さま起因の動作を含むこととします。(規約改定に伴う当該ページの表示にともなって同意する旨の表示されたボタンを押下する動作を義務付ける等)
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑪ 準拠法および裁判管轄
      </Typography>
      <Typography component="p" gutterBottom>
        本規約は、日本法に基づいて解釈されるものとし、本規約に関して訴訟の必要が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
      </Typography>
      <br />
      <Typography variant="subtitle1" gutterBottom>
        ⑫ お問い合わせ
      </Typography>
      <Typography component="p" gutterBottom>
        ご不明な点がございましたら、下記までお問い合わせください。
        <br />
        Qoodish 製作委員会
        <br />
        メールアドレス: support@qoodish.com
      </Typography>
    </Layout>
  );
});
