import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core';
import { Fragment } from 'react';

const styles = {
  body: {
    padding: 0,
    margin: 0
  }
};

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const muiSheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => muiSheets.collect(<App {...props} />),
        enhanceComponent: Component => Component
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <Fragment>
          {initialProps.styles}
          {muiSheets.getStyleElement()}
        </Fragment>
      )
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link
            rel="shortcut icon"
            type="image/x-icon"
            href={process.env.NEXT_PUBLIC_ICON_512}
          />
          <link
            rel="icon"
            type="image/x-icon"
            href={process.env.NEXT_PUBLIC_ICON_512}
          />
          <link
            rel="apple-touch-icon"
            type="image/png"
            href={process.env.NEXT_PUBLIC_ICON_512}
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
          <meta name="twitter:domain" content="qoodish.com" />

          {process.env.NEXT_PUBLIC_ENDPOINT.includes('dev') && (
            <meta name="googlebot" content="noindex" />
          )}
        </Head>
        <body style={styles.body}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
