import createEmotionServer from '@emotion/server/create-instance';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import createEmotionCache from '../../createEmotionCache';

export default class CustomDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/app.webmanifest" />

          <link
            rel="icon"
            type="image/webp"
            sizes="32x32"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x32.webp"
          />
          <link
            rel="icon"
            type="image/webp"
            sizes="16x16"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x16.webp"
          />
          <link
            rel="apple-touch-icon"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone-retina.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="167x167"
            href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad-retina.png"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="preconnect dns-prefetch stylesheet"
          />

          <link
            href="https://www.googleapis.com"
            rel="preconnect dns-prefetch"
          />
          <link
            href="https://www.google-analytics.com"
            rel="preconnect dns-prefetch"
          />
          <link
            href="https://storage.cloud.google.com"
            rel="preconnect dns-prefetch"
          />
          <link
            href="https://storage.googleapis.com"
            rel="preconnect dns-prefetch"
          />

          <meta
            property="fb:app_id"
            content={process.env.NEXT_PUBLIC_FB_APP_ID}
          />

          <meta name="theme-color" content="#ffc107" />

          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Qoodish" />

          <meta name="twitter:domain" content="qoodish.com" />

          {process.env.NEXT_PUBLIC_ENDPOINT.includes('dev') && (
            <meta name="googlebot" content="noindex" />
          )}

          <meta name="emotion-insertion-point" content="" />
          {(this.props as any).emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

CustomDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        }
    });

  const initialProps = await Document.getInitialProps(ctx);

  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags
  };
};
