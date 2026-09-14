import { Map as MapIcon } from '@mui/icons-material';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import CreateMapButton from '../common/CreateMapButton.tsx';
import NoContents from '../common/NoContents.tsx';
import MapGridList from '../maps/MapGridList.tsx';

type Props = {
  maps: AppMap[];
  isOwnProfile: boolean;
};

export default memo(function UserMaps({ maps, isOwnProfile }: Props) {
  const dictionary = useDictionary();

  if (maps.length < 1) {
    return (
      <NoContents
        icon={MapIcon}
        message={
          isOwnProfile
            ? dictionary['maps will see here']
            : dictionary['no maps yet']
        }
        action={isOwnProfile && <CreateMapButton />}
      />
    );
  }

  return <MapGridList maps={maps} />;
});
