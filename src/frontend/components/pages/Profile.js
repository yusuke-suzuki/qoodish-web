import React, { useEffect, useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import SharedProfile from '../organisms/SharedProfile';
import Helmet from 'react-helmet';
import I18n from '../../utils/I18n';

const ProfileHelmet = () => {
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      pathname: state.shared.currentLocation
    }),
    []
  );

  const { currentUser, pathname } = useMappedState(mapState);

  return (
    currentUser.name && (
      <Helmet
        title={`${I18n.t('account')} | Qoodish`}
        link={[
          {
            rel: 'canonical',
            href: `${process.env.ENDPOINT}${pathname}`
          }
        ]}
        meta={[
          {
            name: 'title',
            content: `${I18n.t('account')} | Qoodish`
          },
          {
            name: 'twitter:title',
            content: `${I18n.t('account')} | Qoodish`
          },
          { name: 'twitter:image', content: currentUser.thumbnail_url },
          {
            property: 'og:title',
            content: `${I18n.t('account')} | Qoodish`
          },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}${pathname}`
          }
        ]}
      />
    )
  );
};

const Profile = () => {
  useEffect(() => {
    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/profile',
      page_title: `${I18n.t('account')} | Qoodish`
    });
  }, []);

  return (
    <div>
      <ProfileHelmet />
      <SharedProfile />
    </div>
  );
};

export default React.memo(Profile);
