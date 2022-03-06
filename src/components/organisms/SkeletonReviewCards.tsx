import React from 'react';
import SkeletonReviewCard from '../molecules/SkeletonReviewCard';
import VerticalReviewList from './VerticalReviewList';

type Props = {
  size?: number;
  horizontal?: boolean;
};

const SkeletonReviewCards = (props: Props) => {
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
