import React from 'react';
import SharedProfile from '../../organisms/SharedProfile';
import I18n from '../../../utils/I18n';
import Helmet from 'react-helmet';

class Profile extends React.PureComponent {
  componentDidMount() {
    if (!this.props.currentUser.isAnonymous) {
      this.props.fetchUserProfile();
      this.props.fetchReviews();
      this.props.fetchMyMaps();
      this.props.fetchFollowingMaps();
      this.props.fetchUserLikes();
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/profile',
      page_title: `${I18n.t('account')} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.clearProfileState();
  }

  render() {
    return (
      <div>
        {this.props.currentUser.name &&
          this.renderHelmet(this.props.currentUser)}
        <SharedProfile {...this.props} />
      </div>
    );
  }

  renderHelmet(currentUser) {
    return (
      <Helmet
        title={`${I18n.t('account')} | Qoodish`}
        link={[
          {
            rel: 'canonical',
            href: `${process.env.ENDPOINT}${this.props.pathname}`
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
            content: `${process.env.ENDPOINT}${this.props.pathname}`
          }
        ]}
      />
    );
  }
}

export default Profile;
