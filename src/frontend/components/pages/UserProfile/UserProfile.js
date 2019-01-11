import React from 'react';
import SharedProfile from '../../organisms/SharedProfile';
import Helmet from 'react-helmet';

class UserProfile extends React.PureComponent {
  componentDidMount() {
    if (!this.props.currentUser.isAnonymous) {
      this.props.fetchUserProfile();
      this.props.fetchReviews();
      this.props.fetchMyMaps();
      this.props.fetchFollowingMaps();
      this.props.fetchUserLikes();
    }

    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: `/users/${this.props.currentUser.id}`,
      page_title: `${this.props.currentUser.name} | Qoodish`
    });
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
        title={`${currentUser.name} | Qoodish`}
        link={[
          {
            rel: 'canonical',
            href: `${process.env.ENDPOINT}${this.props.pathname}`
          }
        ]}
        meta={[
          {
            name: 'title',
            content: `${currentUser.name} | Qoodish`
          },
          {
            name: 'twitter:title',
            content: `${currentUser.name} | Qoodish`
          },
          { name: 'twitter:image', content: currentUser.thumbnail_url },
          {
            property: 'og:title',
            content: `${currentUser.name} | Qoodish`
          },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}${this.props.pathname}`
          },
          { property: 'og:image', content: currentUser.thumbnail_url }
        ]}
      />
    );
  }
}

export default UserProfile;
