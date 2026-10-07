import { Place, Whatshot } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import type { Pin } from '../../../types/index.ts';
import { getMapPins } from '../../lib/maps.ts';
import { getPopularPins } from '../../lib/pins.ts';
import { getDictionary } from '../../utils/getDictionary.ts';
import { localePath } from '../../utils/locales.ts';
import SectionHeading from '../common/SectionHeading.tsx';
import PinGridList from './PinGridList.tsx';

const MAX_PINS = 8;

type Props = {
  pin: Pin;
  lang: string;
  token?: string;
};

export default async function RecommendedPins({ pin, lang, token }: Props) {
  const dict = getDictionary(lang);

  const [mapPins, popularPins] = await Promise.all([
    getMapPins(String(pin.map.id), lang, token),
    getPopularPins(lang)
  ]);

  const morePins = mapPins
    .filter((candidate) => candidate.id !== pin.id)
    .slice(0, MAX_PINS);

  const shownPinIds = new Set([pin.id, ...morePins.map(({ id }) => id)]);

  const recommendedPins = popularPins
    .filter((candidate) => !shownPinIds.has(candidate.id))
    .slice(0, MAX_PINS);

  if (morePins.length < 1 && recommendedPins.length < 1) {
    return null;
  }

  return (
    <Stack spacing={{ xs: 4, sm: 6 }} sx={{ mt: { xs: 4, sm: 6 } }}>
      {morePins.length > 0 && (
        <Box component="section">
          <SectionHeading
            icon={<Place color="secondary" />}
            title={dict['more pins on this map']}
            href={localePath(lang, `/maps/${pin.map.id}`)}
            linkLabel={dict['see all']}
          />

          <PinGridList pins={morePins} />
        </Box>
      )}

      {recommendedPins.length > 0 && (
        <Box component="section">
          <SectionHeading
            icon={<Whatshot color="secondary" />}
            title={dict['recommended pins']}
            href={localePath(lang, '/pins')}
            linkLabel={dict['see all']}
          />

          <PinGridList pins={recommendedPins} />
        </Box>
      )}
    </Stack>
  );
}
