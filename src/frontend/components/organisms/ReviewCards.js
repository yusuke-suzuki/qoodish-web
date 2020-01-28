import React from 'react';
import ReviewCard from '../molecules/ReviewCard';
import VerticalReviewList from './VerticalReviewList';

const ReviewCards = props => {
  const { reviews } = props;

  return (
    <VerticalReviewList>
      {reviews.map(review => (
        <ReviewCard currentReview={review} />
      ))}
    </VerticalReviewList>
  );
};

export default React.memo(ReviewCards);
