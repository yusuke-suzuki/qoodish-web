import React from 'react';

import SkeletonMapCard from '../molecules/SkeletonMapCard';
import MapGridList from './MapGridList';

const SkeletonMapCollection = props => {
  const { size, horizontal } = props;

  return (
    <MapGridList horizontal={horizontal ? true : false}>
      {Array.from(new Array(size || 4)).map((v, i) => (
        <SkeletonMapCard key={i} />
      ))}
    </MapGridList>
  );
};

export default React.memo(SkeletonMapCollection);
