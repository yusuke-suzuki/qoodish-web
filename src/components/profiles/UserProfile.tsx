'use client';

import { ReportProblem } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tab,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  memo,
  type SyntheticEvent,
  startTransition,
  useContext,
  useState
} from 'react';
import type {
  AppMap,
  Chapter,
  Journal,
  Pin,
  Profile
} from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ProfileAvatar from '../common/ProfileAvatar.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import EditProfileDialog from './EditProfileDialog.tsx';
import JournalBookmarkButton from './JournalBookmarkButton.tsx';
import UserChapters from './UserChapters.tsx';
import UserMaps from './UserMaps.tsx';
import UserPins from './UserPins.tsx';

type Props = {
  profile: Profile;
  initialPins: Pin[];
  maps: AppMap[];
  journal: Journal | null;
  chapters: Chapter[];
};

function UserProfile({ profile, initialPins, maps, journal, chapters }: Props) {
  const { uid } = useContext(AuthContext);
  const router = useRouter();

  const [tabValue, setTabValue] = useState('1');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const dictionary = useDictionary();

  const isOwnProfile = uid === profile.uid;

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    startTransition(() => {
      setTabValue(newValue);
    });
  };

  const handleProfileSaved = () => {
    router.refresh();
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
  };

  return (
    <>
      <TabContext value={tabValue}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <ProfileAvatar size={96} profile={profile} />

              <Typography variant="h5" fontWeight={600}>
                {profile.name}
                {journal && ` / ${journal.title}`}
              </Typography>

              {profile.biography && (
                <Typography variant="body1">{profile.biography}</Typography>
              )}

              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={3}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {profile.pins_count ?? 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {dictionary.pins}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {profile.maps_count ?? 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {dictionary.maps}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {chapters.length}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {dictionary.chapters}
                  </Typography>
                </Box>
              </Stack>

              {/* A phone has room for one action across the card and nothing
                  else; from sm the card is far wider than the words. */}
              {isOwnProfile ? (
                <Button
                  variant="contained"
                  disableElevation
                  color="inherit"
                  onClick={() => setEditDialogOpen(true)}
                  sx={{ alignSelf: { sm: 'flex-start' } }}
                >
                  {dictionary['edit profile']}
                </Button>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    alignSelf: { sm: 'flex-start' }
                  }}
                >
                  {journal && (
                    <JournalBookmarkButton journal={journal} fullWidth />
                  )}

                  <IconButton
                    title={dictionary['report content']}
                    aria-label={dictionary['report content']}
                    onClick={handleReportClick}
                  >
                    <ReportProblem />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </CardContent>

          <TabList onChange={handleTabChange}>
            <Tab label={dictionary.pins} value="1" />
            <Tab label={dictionary.maps} value="2" />
            <Tab label={dictionary.chapters} value="3" />
          </TabList>
        </Card>

        <TabPanel value="1" sx={{ px: 0 }}>
          <UserPins
            userId={profile.id}
            initialPins={initialPins}
            isOwnProfile={isOwnProfile}
          />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <UserMaps maps={maps} isOwnProfile={isOwnProfile} />
        </TabPanel>
        <TabPanel value="3" sx={{ px: 0 }}>
          <UserChapters chapters={chapters} />
        </TabPanel>
      </TabContext>

      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentProfile={profile}
        journal={journal}
        onSaved={handleProfileSaved}
      />

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="User"
        moderatableId={profile.id}
      />
    </>
  );
}

export default memo(UserProfile);
