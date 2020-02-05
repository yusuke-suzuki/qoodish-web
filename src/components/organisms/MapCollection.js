import React from 'react';

import MapCard from '../molecules/MapCard';
import MapGridList from './MapGridList';

const MapCollection = props => {
  const { maps, horizontal } = props;

  return (
    <MapGridList horizontal={horizontal ? true : false}>
      {maps.map(map => (
        <MapCard key={map.id} map={map} />
      ))}
    </MapGridList>
  );
};

export default React.memo(MapCollection);
