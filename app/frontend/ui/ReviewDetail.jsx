import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import Helmet from 'react-helmet';
import I18n from '../containers/I18n';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
  },
  containerSmall: {
    margin: '56px auto 56px'
  },
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
};

class ReviewDetail extends React.PureComponent {
  async componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.currentReview) {
      await this.props.fetchReview();
    }
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': `/maps/${this.props.currentReview.map.id}/reports/${this.props.currentReview.id}`,
      'page_title': `${this.props.currentReview.spot.name} - ${this.props.currentReview.map.name} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.clear();
  }

  render() {
    return (
      <div
        style={this.props.large ? styles.containerLarge : styles.containerSmall}
      >
        {this.props.currentReview && this.renderHelmet(this.props.currentReview)}
        {this.props.reviewLoading
          ? this.renderProgress()
          : this.renderReviewCard()}
      </div>
    );
  }

  renderHelmet(review) {
    return (
      <Helmet
        title={`${review.spot.name} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/maps/${review.map.id}/${review.id}` }
        ]}
        meta={[
          { name: 'title', content: `${review.spot.name} - ${review.map.name} | Qoodish` },
          { name: 'keywords', content: `${review.map.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`},
          { name: 'description', content: review.comment },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `${review.spot.name} - ${review.map.name} | Qoodish` },
          { name: 'twitter:description', content: review.comment },
          { name: 'twitter:image', content: review.image ? review.image.url : process.env.SUBSTITUTE_URL },
          { property: 'og:title', content: `${review.spot.name} - ${review.map.name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/maps/${review.map.id}/${review.id}`
          },
          { property: 'og:image', content: review.image ? review.image.url : process.env.SUBSTITUTE_URL },
          {
            property: 'og:description',
            content: review.comment
          }
        ]}
      />
    );
  }

  renderReviewCard() {
    if (this.props.currentReview) {
      return (
        <ReviewCardContainer
          currentReview={this.props.currentReview}
          detail={!this.props.large}
        />
      );
    } else {
      return (
        <NoContentsContainer
          contentType="review"
          message={I18n.t('reports will see here')}
        />
      );
    }
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }
}

export default ReviewDetail;
