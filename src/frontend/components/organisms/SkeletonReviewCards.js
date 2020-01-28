import React from 'react';
import SkeletonReviewCard from '../molecules/SkeletonReviewCard';
import VerticalReviewList from './VerticalReviewList';

const SkeletonReviewCards = props => {
  const { size } = props;

  return (
    <VerticalReviewList>
      {Array.from(new Array(size || 2)).map((v, i) => (
        <SkeletonReviewCard key={i} />
      ))}
    </VerticalReviewList>
  );
};

export default React.memo(SkeletonReviewCards);
