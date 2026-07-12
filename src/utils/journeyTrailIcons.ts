import { amber } from '@mui/material/colors';

const FOOTPRINT_PATH_LEFT =
  'M 12,1.5 C 9,1.5 6.7,4 6.7,8.5 C 6.1,11.5 6.4,15 7.4,17 L 14.4,17 ' +
  'C 15.8,14.5 16.8,12 16.8,9 C 16.8,4.5 15,1.5 12,1.5 Z ' +
  'M 8,19.5 L 14,19.5 C 15.15,21.7 15.6,23.5 14.8,25.7 ' +
  'C 14,27.9 10.4,28.3 8.8,26.5 C 7.4,24.8 7.2,21.7 8,19.5 Z';

export const FOOTPRINT_PATH_RIGHT =
  'M 12,1.5 C 15,1.5 17.3,4 17.3,8.5 C 17.9,11.5 17.6,15 16.6,17 L 9.6,17 ' +
  'C 8.2,14.5 7.2,12 7.2,9 C 7.2,4.5 9,1.5 12,1.5 Z ' +
  'M 16,19.5 L 10,19.5 C 8.85,21.7 8.4,23.5 9.2,25.7 ' +
  'C 10,27.9 13.6,28.3 15.2,26.5 C 16.6,24.8 16.8,21.7 16,19.5 Z';

export const FOOTPRINT_COLOR = amber[500];

export function footprintIcons(
  Point: typeof google.maps.Point
): google.maps.IconSequence[] {
  const symbol = (
    path: string,
    anchor: google.maps.Point
  ): google.maps.Symbol => ({
    path,
    anchor,
    scale: 0.5,
    fillColor: FOOTPRINT_COLOR,
    fillOpacity: 0.9,
    strokeOpacity: 0
  });

  return [
    {
      icon: symbol(FOOTPRINT_PATH_LEFT, new Point(24, 15)),
      offset: '0',
      repeat: '46px'
    },
    {
      icon: symbol(FOOTPRINT_PATH_RIGHT, new Point(0, 15)),
      offset: '23px',
      repeat: '46px'
    }
  ];
}
