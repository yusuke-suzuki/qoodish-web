'use client';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Tab,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  type SyntheticEvent,
  memo,
  startTransition,
  useCallback,
  useContext,
  useState
} from 'react';
import type { AppMap, Chapter, Journal, Profile, Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import ProfileAvatar from '../common/ProfileAvatar';
import EditProfileDialog from './EditProfileDialog';
import JournalBookmarkButton from './JournalBookmarkButton';
import UserChapters from './UserChapters';
import UserMaps from './UserMaps';
import UserReviews from './UserReviews';

type Props = {
  profile: Profile;
  initialReviews: Review[];
  maps: AppMap[];
  journal: Journal | null;
  chapters: Chapter[];
};

function UserProfile({
  profile,
  initialReviews,
  maps,
  journal,
  chapters
}: Props) {
  const { uid } = useContext(AuthContext);
  const router = useRouter();

  const [tabValue, setTabValue] = useState('1');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const dictionary = useDictionary();

  const isOwnProfile = uid === profile.uid;

  const handleTabChange = useCallback(
    (_event: SyntheticEvent<Element, Event>, newValue: string) => {
      startTransition(() => {
        setTabValue(newValue);
      });
    },
    []
  );

  const handleProfileSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <>
      <TabContext value={tabValue}>
        <Card elevation={0}>
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
                    {profile.reviews_count ?? 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {dictionary.spots}
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

              {isOwnProfile ? (
                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  color="inherit"
                  onClick={() => setEditDialogOpen(true)}
                >
                  {dictionary['edit profile']}
                </Button>
              ) : (
                journal && <JournalBookmarkButton journal={journal} fullWidth />
              )}
            </Stack>
          </CardContent>

          <TabList onChange={handleTabChange}>
            <Tab label={dictionary.spots} value="1" />
            <Tab label={dictionary.maps} value="2" />
            <Tab label={dictionary.chapters} value="3" />
          </TabList>
        </Card>

        <TabPanel value="1" sx={{ px: 0 }}>
          <UserReviews
            userId={profile.id}
            initialReviews={initialReviews}
            isOwnProfile={isOwnProfile}
          />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <UserMaps maps={maps} />
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
    </>
  );
}

export default memo(UserProfile);
