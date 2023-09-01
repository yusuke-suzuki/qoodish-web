import { Map as MapIcon } from '@mui/icons-material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { useUserMaps } from '../../hooks/useUserMaps';
import NoContents from '../common/NoContents';
import MapGridList from '../maps/MapGridList';

type Props = {
  id: number | null;
};

export default memo(function UserMaps({ id }: Props) {
  const { maps, isLoading } = useUserMaps(id);

  const dictionary = useDictionary();

  if (!isLoading && maps.length < 1) {
    return (
      <NoContents icon={MapIcon} message={dictionary['maps will see here']} />
    );
  }

  console.log(maps);

  return <MapGridList maps={maps} />;
});
