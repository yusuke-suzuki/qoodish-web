'use client';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Card, Tab } from '@mui/material';
import { memo, type SyntheticEvent, useState } from 'react';
import type { AppMap, Journal } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import UserBookmarks from '../profiles/UserBookmarks.tsx';
import BookmarkedJournalList from './BookmarkedJournalList.tsx';

type Props = {
  maps: AppMap[];
  journals: Journal[];
};

function BookmarksView({ maps, journals }: Props) {
  const dictionary = useDictionary();
  const [tabValue, setTabValue] = useState('1');

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    setTabValue(newValue);
  };

  return (
    <TabContext value={tabValue}>
      <Card elevation={0}>
        <TabList onChange={handleTabChange} variant="fullWidth">
          <Tab label={dictionary.maps} value="1" />
          <Tab label={dictionary.journal} value="2" />
        </TabList>
      </Card>

      <TabPanel value="1" sx={{ px: 0 }}>
        <UserBookmarks maps={maps} />
      </TabPanel>
      <TabPanel value="2" sx={{ px: 0 }}>
        <BookmarkedJournalList journals={journals} />
      </TabPanel>
    </TabContext>
  );
}

export default memo(BookmarksView);
