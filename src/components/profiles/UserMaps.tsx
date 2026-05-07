import { Map as MapIcon } from '@mui/icons-material';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';
import MapGridList from '../maps/MapGridList';

type Props = {
  maps: AppMap[];
};

export default memo(function UserMaps({ maps }: Props) {
  const dictionary = useDictionary();

  if (maps.length < 1) {
    return (
      <NoContents icon={MapIcon} message={dictionary['maps will see here']} />
    );
  }

  return <MapGridList maps={maps} />;
});
