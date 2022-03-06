import React from 'react';

import MapCard from '../molecules/MapCard';
import MapGridList from './MapGridList';
import SkeletonMapCollection from './SkeletonMapCollection';

type Props = {
  maps: any[];
  horizontal?: boolean;
};

const MapCollection = (props: Props) => {
  const { maps, horizontal } = props;

  if (maps.length < 1) {
    return <SkeletonMapCollection horizontal={horizontal ? true : false} />;
  }

  return (
    <MapGridList horizontal={horizontal ? true : false}>
      {maps.map(map => (
        <MapCard key={map.id} map={map} />
      ))}
    </MapGridList>
  );
};

export default React.memo(MapCollection);
