import React, { memo } from 'react';
import { FacebookProvider, Page } from 'react-facebook';

export default memo(function FbPage() {
  return (
    <FacebookProvider appId={process.env.NEXT_PUBLIC_FB_APP_ID}>
      <Page href="https://www.facebook.com/qoodish" />
    </FacebookProvider>
  );
});
