import { Bookmarks } from '@mui/icons-material';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';
import MapGridList from '../maps/MapGridList';

type Props = {
  maps: AppMap[];
};

export default memo(function UserBookmarks({ maps }: Props) {
  const dictionary = useDictionary();

  if (maps.length < 1) {
    return (
      <NoContents icon={Bookmarks} message={dictionary['no bookmarked maps']} />
    );
  }

  return <MapGridList maps={maps} />;
});
