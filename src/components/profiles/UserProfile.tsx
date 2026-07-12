'use client';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
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
import type { AppMap, Chapter, Profile, Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import ProfileAvatar from '../common/ProfileAvatar';
import EditProfileDialog from './EditProfileDialog';
import UserBookmarks from './UserBookmarks';
import UserChapters from './UserChapters';
import UserMaps from './UserMaps';
import UserReviews from './UserReviews';

type Props = {
  profile: Profile;
  initialReviews: Review[];
  maps: AppMap[];
  bookmarks: AppMap[];
  chapters: Chapter[];
};

function UserProfile({
  profile,
  initialReviews,
  maps,
  bookmarks,
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
            <Stack
              spacing={1}
              sx={{
                placeItems: 'center'
              }}
            >
              <ProfileAvatar size={100} profile={profile} />

              <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight={600}
              >
                {profile.name}
              </Typography>

              <Typography variant="body1" align="center" gutterBottom>
                {profile.biography}
              </Typography>

              {isOwnProfile && (
                <Button
                  variant="contained"
                  disableElevation
                  color="inherit"
                  onClick={() => setEditDialogOpen(true)}
                >
                  {dictionary['edit profile']}
                </Button>
              )}

              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={2}
              >
                <Stack justifyContent="center">
                  <Typography variant="h6" fontWeight="bold" align="center">
                    {profile.reviews_count ?? 0}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {dictionary.spots}
                  </Typography>
                </Stack>

                <Stack justifyContent="center">
                  <Typography variant="h6" fontWeight="bold" align="center">
                    {profile.maps_count ?? 0}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {dictionary.maps}
                  </Typography>
                </Stack>

                <Stack justifyContent="center">
                  <Typography variant="h6" fontWeight="bold" align="center">
                    {chapters.length}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    align="center"
                  >
                    {dictionary.chapters}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>

          <TabList
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={dictionary.spots} value="1" />
            <Tab label={dictionary.maps} value="2" />
            <Tab label={dictionary.bookmarks} value="3" />
            <Tab label={dictionary.chapters} value="4" />
          </TabList>
        </Card>

        <TabPanel value="1" sx={{ px: 0 }}>
          <UserReviews userId={profile.id} initialReviews={initialReviews} />
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0 }}>
          <UserMaps maps={maps} />
        </TabPanel>
        <TabPanel value="3" sx={{ px: 0 }}>
          <UserBookmarks maps={bookmarks} />
        </TabPanel>
        <TabPanel value="4" sx={{ px: 0 }}>
          <UserChapters chapters={chapters} />
        </TabPanel>
      </TabContext>

      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentProfile={profile}
        onSaved={handleProfileSaved}
      />
    </>
  );
}

export default memo(UserProfile);
