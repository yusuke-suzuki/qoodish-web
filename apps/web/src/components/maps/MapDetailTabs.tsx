import { HistoryEdu, Place } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { memo, type SyntheticEvent, useState } from 'react';
import type { Chapter, Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import MapChapterList from './MapChapterList.tsx';
import MapPinList from './MapPinList.tsx';

type Props = {
  pins: Pin[];
  chapters: Chapter[];
  onPinClick?: (pin: Pin) => void;
};

function MapDetailTabs({ pins, chapters, onPinClick }: Props) {
  const dictionary = useDictionary();

  const [tabValue, setTabValue] = useState('pins');

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    setTabValue(newValue);
  };

  return (
    <TabContext value={tabValue}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleTabChange} variant="fullWidth">
          <Tab
            icon={<Place />}
            iconPosition="start"
            label={dictionary.pins}
            value="pins"
          />
          <Tab
            icon={<HistoryEdu />}
            iconPosition="start"
            label={dictionary.chapters}
            value="chapters"
          />
        </TabList>
      </Box>

      <TabPanel value="pins" sx={{ px: 2, py: 0 }}>
        <MapPinList pins={pins} onPinClick={onPinClick} />
      </TabPanel>
      <TabPanel value="chapters" sx={{ px: 2, py: 0 }}>
        <MapChapterList chapters={chapters} />
      </TabPanel>
    </TabContext>
  );
}

export default memo(MapDetailTabs);
