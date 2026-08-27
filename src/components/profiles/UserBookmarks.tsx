import { Bookmarks } from '@mui/icons-material';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import NoContents from '../common/NoContents.tsx';
import MapGridList from '../maps/MapGridList.tsx';

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
