import { Map as MapIcon } from '@mui/icons-material';
import { memo, useCallback, useEffect, useState } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';
import MapGridList from '../maps/MapGridList';

type Props = {
  userId: number;
};

export default memo(function UserMaps({ userId }: Props) {
  const [maps, setMaps] = useState<AppMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dictionary = useDictionary();

  const loadMaps = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/v1/users/${userId}/maps`);

      if (res.ok) {
        const data: AppMap[] = await res.json();
        setMaps(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  if (!isLoading && maps.length < 1) {
    return (
      <NoContents icon={MapIcon} message={dictionary['maps will see here']} />
    );
  }

  return <MapGridList maps={maps} />;
});
