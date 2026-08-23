import { HistoryEdu, Place } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { memo, type SyntheticEvent, useState } from 'react';
import type { Chapter, Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import MapChapterList from './MapChapterList';
import MapReviewList from './MapReviewList';

type Props = {
  reviews: Review[];
  chapters: Chapter[];
  onReviewClick?: (review: Review) => void;
};

function MapDetailTabs({ reviews, chapters, onReviewClick }: Props) {
  const dictionary = useDictionary();

  const [tabValue, setTabValue] = useState('spots');

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
            label={dictionary.spots}
            value="spots"
          />
          <Tab
            icon={<HistoryEdu />}
            iconPosition="start"
            label={dictionary.chapters}
            value="chapters"
          />
        </TabList>
      </Box>

      <TabPanel value="spots" sx={{ px: 2, py: 0 }}>
        <MapReviewList reviews={reviews} onReviewClick={onReviewClick} />
      </TabPanel>
      <TabPanel value="chapters" sx={{ px: 2, py: 0 }}>
        <MapChapterList chapters={chapters} />
      </TabPanel>
    </TabContext>
  );
}

export default memo(MapDetailTabs);
