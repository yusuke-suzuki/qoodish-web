import React from 'react';
import { FacebookProvider, Page } from 'react-facebook';

const FbPage = () => {
  return (
    <FacebookProvider appId={process.env.FB_APP_ID}>
      <Page href="https://www.facebook.com/qoodish" />
    </FacebookProvider>
  );
};

export default React.memo(FbPage);
