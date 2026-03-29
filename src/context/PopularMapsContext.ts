import { createContext } from 'react';
import type { AppMap } from '../../types';

type ContextProps = {
  popularMaps: AppMap[];
};

const PopularMapsContext = createContext<ContextProps>({
  popularMaps: []
});

export default PopularMapsContext;
