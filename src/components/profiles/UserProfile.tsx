'use client';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Alert,
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
import useBlock from '../../hooks/useBlock.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useMute from '../../hooks/useMute.ts';
import BlockUserDialog from '../common/BlockUserDialog.tsx';
import ProfileAvatar from '../common/ProfileAvatar.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import EditProfileDialog from './EditProfileDialog.tsx';
import JournalBookmarkButton from './JournalBookmarkButton.tsx';
import UserChapters from './UserChapters.tsx';
import UserMaps from './UserMaps.tsx';
import UserMenuButton from './UserMenuButton.tsx';
import UserPins from './UserPins.tsx';

type Props = {
  profile: Profile;
  initialPins: Pin[];
  maps: AppMap[];
  journal: Journal | null;
  chapters: Chapter[];
};

function UserProfile({ profile, initialPins, maps, journal, chapters }: Props) {
  const { uid, authenticated } = useContext(AuthContext);
  const router = useRouter();

  const [tabValue, setTabValue] = useState('1');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockedPostsShown, setBlockedPostsShown] = useState(false);

  const dictionary = useDictionary();
  const { pending: blockPending, block, unblock } = useBlock();
  const { pending: mutePending, mute, unmute } = useMute();

  const isOwnProfile = uid === profile.uid;
  const postsBlocked =
    Boolean(profile.blocked_by) ||
    (Boolean(profile.blocking) && !blockedPostsShown);

  const handleBlockConfirm = async () => {
    const blocked = await block(profile.id);

    if (!blocked) {
      return;
    }

    setBlockDialogOpen(false);
    setBlockedPostsShown(false);
  };

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
                  {journal && !profile.blocking && !profile.blocked_by && (
                    <JournalBookmarkButton journal={journal} fullWidth />
                  )}

                  <UserMenuButton
                    profile={profile}
                    authenticated={authenticated}
                    disabled={blockPending || mutePending}
                    onReportClick={handleReportClick}
                    onBlockClick={() => setBlockDialogOpen(true)}
                    onUnblockClick={() => unblock(profile.id)}
                    onMuteClick={() => mute(profile.id)}
                    onUnmuteClick={() => unmute(profile.id)}
                  />
                </Stack>
              )}

              {profile.blocked_by && (
                <Alert severity="warning">
                  {dictionary['blocked by notice']}
                </Alert>
              )}

              {profile.blocking && (
                <Alert
                  severity="info"
                  action={
                    !blockedPostsShown && (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => setBlockedPostsShown(true)}
                      >
                        {dictionary['show posts']}
                      </Button>
                    )
                  }
                >
                  {dictionary['blocking notice']}
                </Alert>
              )}

              {profile.muting && (
                <Alert
                  severity="info"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      loading={mutePending}
                      disabled={blockPending}
                      onClick={() => unmute(profile.id)}
                    >
                      {dictionary.unmute}
                    </Button>
                  }
                >
                  {dictionary['muting notice']}
                </Alert>
              )}
            </Stack>
          </CardContent>

          {!postsBlocked && (
            <TabList onChange={handleTabChange}>
              <Tab label={dictionary.pins} value="1" />
              <Tab label={dictionary.maps} value="2" />
              <Tab label={dictionary.chapters} value="3" />
            </TabList>
          )}
        </Card>

        {!postsBlocked && (
          <>
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
          </>
        )}
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

      <BlockUserDialog
        open={blockDialogOpen}
        loading={blockPending}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
      />
    </>
  );
}

export default memo(UserProfile);
